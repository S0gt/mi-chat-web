// ========================================
// DATABASE.JS - CONFIGURACIÓN DE BASE DE DATOS
// ========================================

// Base de datos SIMPLE EN MEMORIA para empezar rápidamente
// Después migraremos a MySQL/PostgreSQL

class SimpleDatabase {
    constructor() {
        // Usuarios registrados
        this.users = new Map([
            ['admin', {
                id: 1,
                usuario: 'admin',
                password: 'admin123', // En producción usar bcrypt
                email: 'admin@chat.com',
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
                avatar: '',
                fecha_registro: new Date().toISOString(),
                ultimo_acceso: new Date().toISOString(),
                activo: true
            }]
        ]);
        
        // Mensajes del chat
        this.messages = [];
        
        // Usuarios conectados
        this.activeUsers = new Map();
        
        // Contador de IDs
        this.nextUserId = 3;
        this.nextMessageId = 1;
        
        console.log('📂 Base de datos simple inicializada');
        console.log('👥 Usuarios por defecto: admin/admin123, test/test123');
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
