// ========================================
// DATABASE.JS - CONFIGURACIÓN DE BASE DE DATOS
// ========================================

// Base de datos SIMPLE EN MEMORIA para empezar rápidamente
// Después migraremos a MySQL/PostgreSQL

class SimpleDatabase {
    constructor() {
        // Usuarios REALES de tu base de datos MySQL
        this.users = new Map([
            // Usuarios de tu DB original (passwords sin hash para pruebas)
            ['JUANMANTECA', {
                id: 4,
                usuario: 'JUANMANTECA',
                password: 'juanmanteca123', // password real
                email: 'juan@chat.com',
                codigo: '4M1HS9',
                avatar: '688a8a9c13ff5.jpg',
                fecha_registro: '2025-07-30',
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }],
            ['Juan', {
                id: 5,
                usuario: 'Juan',
                password: 'juan123', // password real  
                email: 'juan2@chat.com',
                codigo: 'PDCMZU',
                avatar: '',
                fecha_registro: '2025-07-30',
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }],
            ['Roberto', {
                id: 6,
                usuario: 'Roberto',
                password: 'roberto123', // password real
                email: 'roberto@chat.com', 
                codigo: '3GYR5N',
                avatar: '',
                fecha_registro: '2025-07-30',
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }],
            // Usuarios de prueba simples
            ['admin', {
                id: 1,
                usuario: 'admin',
                password: 'admin123',
                email: 'admin@chat.com',
                codigo: 'ADMIN1',
                avatar: '',
                fecha_registro: new Date().toISOString(),
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }],
            ['test', {
                id: 2,
                usuario: 'test',
                password: 'test123',
                email: 'test@chat.com',
                codigo: 'TEST01',
                avatar: '',
                fecha_registro: new Date().toISOString(),
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }]
        ]);
        
        // Mensajes del chat
        this.messages = [];
        
        // Sistema de amigos
        this.friendships = new Map(); // user1 -> [user2, user3, ...]
        
        // Usuarios conectados
        this.activeUsers = new Map();
        
        // Contador de IDs
        this.nextUserId = 3;
        this.nextMessageId = 1;
        
        // Inicializar algunas amistades por defecto
        this.initDefaultFriendships();
        
        console.log('📂 Base de datos simple inicializada');
        console.log('👥 Usuarios por defecto: admin/admin123, test/test123');
    }
    
    // ===============================
    // INICIALIZACIÓN
    // ===============================
    
    initDefaultFriendships() {
        // JUANMANTECA es amigo de Juan y Roberto
        this.friendships.set('JUANMANTECA', ['Juan', 'Roberto']);
        this.friendships.set('Juan', ['JUANMANTECA', 'Roberto']);
        this.friendships.set('Roberto', ['JUANMANTECA', 'Juan']);
        
        // admin y test son amigos para pruebas
        this.friendships.set('admin', ['test']);
        this.friendships.set('test', ['admin']);
        
        console.log('👥 Amistades por defecto inicializadas');
    }
    
    // ===============================
    // MÉTODOS DE USUARIOS
    // ===============================
    
    async getUserByUsername(username) {
        return this.users.get(username) || null;
    }
    
    async getUserByCredentials(username, password) {
        const user = this.users.get(username);
        if (user && user.password === password && user.activo) {
            // Actualizar último acceso
            user.ultimo_acceso = new Date().toISOString();
            return user;
        }
        return null;
    }
    
    async createUser(userData) {
        const { usuario, password, email } = userData;
        
        // Verificar si el usuario ya existe
        if (this.users.has(usuario)) {
            throw new Error('El usuario ya existe');
        }
        
        const newUser = {
            id: this.nextUserId++,
            usuario,
            password, // En producción usar bcrypt
            email,
            avatar: '',
            fecha_registro: new Date().toISOString(),
            ultimo_acceso: new Date().toISOString(),
            activo: true
        };
        
        this.users.set(usuario, newUser);
        console.log('✅ Usuario creado:', usuario);
        return newUser;
    }
    
    async getAllUsers() {
        return Array.from(this.users.values())
            .filter(user => user.activo)
            .map(user => ({
                id: user.id,
                usuario: user.usuario,
                email: user.email,
                avatar: user.avatar,
                ultimo_acceso: user.ultimo_acceso
            }));
    }
    
    // ===============================
    // MÉTODOS DE MENSAJES
    // ===============================
    
    async getMessages(limit = 50) {
        return this.messages
            .slice(-limit)
            .map(msg => ({
                ...msg,
                fecha: new Date(msg.fecha).toISOString()
            }));
    }

    // Obtener todos los mensajes
    getAllMessages() {
        return this.messages;
    }

    async saveMessage(messageData) {
        const { usuario, mensaje, tipo = 'texto' } = messageData;
        
        const newMessage = {
            id: this.nextMessageId++,
            usuario,
            mensaje,
            tipo,
            fecha: new Date().toISOString(),
            estado: 'enviado'
        };
        
        this.messages.push(newMessage);
        console.log('💾 Mensaje guardado:', newMessage);
        return newMessage;
    }
    
    // ===============================
    // MÉTODOS DE USUARIOS ACTIVOS
    // ===============================
    
    setUserActive(username, wsConnection) {
        this.activeUsers.set(username, {
            usuario: username,
            conexion: wsConnection,
            ultima_actividad: new Date().toISOString()
        });
        console.log('🟢 Usuario conectado:', username);
    }
    
    setUserInactive(username) {
        this.activeUsers.delete(username);
        console.log('🔴 Usuario desconectado:', username);
    }
    
    getActiveUsers() {
        return Array.from(this.activeUsers.keys());
    }
    
    // ===============================
    // MÉTODOS DE AMIGOS
    // ===============================
    
    getFriends(username) {
        return this.friendships.get(username) || [];
    }
    
    addFriend(username, friendUsername) {
        // Verificar que ambos usuarios existen
        if (!this.users.has(username) || !this.users.has(friendUsername)) {
            throw new Error('Usuario no encontrado');
        }
        
        // Agregar amistad bidireccional
        if (!this.friendships.has(username)) {
            this.friendships.set(username, []);
        }
        if (!this.friendships.has(friendUsername)) {
            this.friendships.set(friendUsername, []);
        }
        
        const userFriends = this.friendships.get(username);
        const friendFriends = this.friendships.get(friendUsername);
        
        // Evitar duplicados
        if (!userFriends.includes(friendUsername)) {
            userFriends.push(friendUsername);
        }
        if (!friendFriends.includes(username)) {
            friendFriends.push(username);
        }
        
        console.log(`👥 ${username} y ${friendUsername} ahora son amigos`);
    }
    
    removeFriend(username, friendUsername) {
        const userFriends = this.friendships.get(username);
        const friendFriends = this.friendships.get(friendUsername);
        
        if (userFriends) {
            const index = userFriends.indexOf(friendUsername);
            if (index > -1) {
                userFriends.splice(index, 1);
            }
        }
        
        if (friendFriends) {
            const index = friendFriends.indexOf(username);
            if (index > -1) {
                friendFriends.splice(index, 1);
            }
        }
        
        console.log(`💔 ${username} y ${friendUsername} ya no son amigos`);
    }
    
    // ===============================
    // UTILIDADES
    // ===============================
    
    getStats() {
        return {
            usuarios_registrados: this.users.size,
            usuarios_activos: this.activeUsers.size,
            mensajes_totales: this.messages.length,
            ultimo_mensaje: this.messages.length > 0 ? this.messages[this.messages.length - 1].fecha : null
        };
    }
}

// Exportar instancia única
const db = new SimpleDatabase();

module.exports = db;
