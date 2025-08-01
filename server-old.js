const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000; // IMPORTANTE: usar variable de entorno para Render

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

console.log('🚀 Iniciando Mi Chat Web para Render...');
console.log('� Estadísticas de DB:', db.getStats());

// =======================================
// API ROUTES (Reemplazando el PHP)
// =======================================

// API para registro de usuarios
app.post('/api/register', async (req, res) => {
    const { usuario, password, email } = req.body;
    
    console.log('📝 Intento de registro:', usuario);
    
    if (!usuario || !password) {
        return res.json({ success: false, error: 'Usuario y contraseña requeridos' });
    }
    
    try {
        const newUser = await db.createUser({ usuario, password, email });
        console.log('✅ Usuario registrado:', usuario);
        
        res.json({ 
            success: true, 
            user_id: newUser.id,
            message: 'Usuario registrado exitosamente'
        });
    } catch (error) {
        console.log('❌ Error en registro:', error.message);
        res.json({ success: false, error: error.message });
    }
});

// API para login
app.post('/api/login', async (req, res) => {
    const { usuario, password } = req.body;
    
    console.log('🔑 Intento de login:', usuario);
    
    try {
        const user = await db.getUserByCredentials(usuario, password);
        
        if (user) {
            console.log('✅ Login exitoso:', usuario);
            res.json({ 
                success: true, 
                user_id: user.id,
                usuario: user.usuario,
                email: user.email
            });
        } else {
            console.log('❌ Login fallido:', usuario);
            res.json({ success: false, error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.log('❌ Error en login:', error.message);
        res.json({ success: false, error: 'Error del servidor' });
    }
});
    
    if (user && user.password === password) {
        console.log('✅ Login exitoso:', usuario);
        res.json({ 
            success: true, 
            logueado: true,
            usuario: user.usuario, 
            usuario_id: user.id,
            user_id: user.id,
            codigo: user.codigo 
        });
    } else {
        console.log('❌ Login fallido:', usuario);
        res.json({ 
            success: false, 
            logueado: false,
            error: 'Credenciales incorrectas' 
        });
    }
});

// API para verificar sesión (simplificada)
app.get('/api/sesion', (req, res) => {
    // En una implementación real, verificarías JWT o session
    // Por ahora, simplificamos
    res.json({ 
        logueado: false,
        message: 'Usar login endpoint'
    });
});

// API para obtener usuarios (amigos)
app.get('/api/users', (req, res) => {
    const usersList = Array.from(users.values()).map(user => ({
        id: user.id,
        usuario: user.usuario,
        codigo: user.codigo,
        avatar: null // Implementar más tarde
    }));
    
    console.log('👥 Enviando lista de usuarios:', usersList.length);
    res.json({ 
        success: true, 
        users: usersList 
    });
});

// API para obtener mensajes entre dos usuarios
app.get('/api/messages', (req, res) => {
    const { user_id } = req.query;
    
    if (!user_id) {
        return res.json({ success: false, error: 'user_id requerido' });
    }
    
    // En una implementación real, filtrarías por autenticación
    const userMessages = messages.filter(msg => 
        msg.de_id == user_id || msg.para_id == user_id
    );
    
    console.log(`💬 Enviando ${userMessages.length} mensajes para usuario ${user_id}`);
    res.json({ 
        success: true, 
        messages: userMessages 
    });
});

// API para enviar mensaje (respaldo si WebSocket falla)
app.post('/api/send_message', (req, res) => {
    const { receptor_id, mensaje } = req.body;
    
    if (!receptor_id || !mensaje) {
        return res.json({ success: false, error: 'Faltan datos' });
    }
    
    const newMessage = {
        id: messages.length + 1,
        de_id: 1, // Placeholder - en real obtener de sesión
        para_id: parseInt(receptor_id),
        emisor_id: 1,
        receptor_id: parseInt(receptor_id),
        mensaje: mensaje,
        texto: mensaje,
        fecha_envio: new Date().toISOString(),
        fecha: new Date().toISOString(),
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    console.log('📨 Mensaje guardado via API');
    
    res.json({ success: true, message_id: newMessage.id });
});

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// =======================================
// WEBSOCKET SERVER
// =======================================

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

console.log('🔌 Configurando WebSocket Server...');

wss.on('connection', (ws, req) => {
    const clientId = `client_${Date.now()}`;
    console.log('🔗 Nueva conexión WebSocket:', clientId);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log(`📨 [${clientId}] Tipo: ${data.tipo || data.type}`);
            
            switch (data.tipo || data.type) {
                case 'login':
                    // Usuario se conecta al WebSocket
                    ws.userId = data.userId;
                    ws.username = data.username;
                    activeUsers.set(data.userId.toString(), ws);
                    
                    console.log(`👤 Usuario ${data.username} conectado al WebSocket`);
                    
                    // Confirmar conexión
                    ws.send(JSON.stringify({
                        tipo: 'login_success',
                        mensaje: 'Conectado al servidor en tiempo real'
                    }));
                    
                    // Notificar usuarios activos
                    broadcastActiveUsers();
                    break;
                    
                case 'mensaje':
                    // Mensaje de chat en tiempo real
                    const newMessage = {
                        id: messages.length + 1,
                        de_id: data.de || data.userId,
                        para_id: data.para || data.receptor_id,
                        emisor_id: data.de || data.userId,
                        receptor_id: data.para || data.receptor_id,
                        mensaje: data.mensaje,
                        texto: data.mensaje,
                        fecha_envio: new Date().toISOString(),
                        fecha: new Date().toISOString(),
                        timestamp: new Date().toISOString(),
                        grupo_id: data.grupo_id || null
                    };
                    
                    messages.push(newMessage);
                    console.log(`💬 Mensaje WebSocket: ${data.de} → ${data.para}`);
                    
                    // Enviar a destinatario si está conectado
                    if (data.para) {
                        const targetUser = activeUsers.get(data.para.toString());
                        if (targetUser && targetUser.readyState === WebSocket.OPEN) {
                            targetUser.send(JSON.stringify({
                                tipo: 'mensaje',
                                ...newMessage
                            }));
                            console.log('✅ Mensaje entregado en tiempo real');
                        }
                    }
                    
                    // Enviar confirmación al remitente
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            tipo: 'mensaje_enviado',
                            message_id: newMessage.id
                        }));
                    }
                    break;
                    
                case 'typing':
                    // Indicador de escritura
                    if (data.para) {
                        const targetUser = activeUsers.get(data.para.toString());
                        if (targetUser && targetUser.readyState === WebSocket.OPEN) {
                            targetUser.send(JSON.stringify(data));
                        }
                    }
                    break;
                    
                default:
                    console.log(`🔍 Tipo de mensaje no reconocido: ${data.tipo || data.type}`);
            }
        } catch (error) {
            console.error('❌ Error procesando mensaje WebSocket:', error);
        }
    });
    
    ws.on('close', (code, reason) => {
        if (ws.userId) {
            activeUsers.delete(ws.userId.toString());
            console.log(`👋 Usuario ${ws.username} desconectado del WebSocket`);
            broadcastActiveUsers();
        } else {
            console.log(`👋 Cliente ${clientId} desconectado`);
        }
    });
    
    ws.on('error', (error) => {
        console.error(`❌ Error WebSocket [${clientId}]:`, error.message);
    });
});

// Función para notificar usuarios activos
function broadcastActiveUsers() {
    const activeUsersList = Array.from(activeUsers.keys());
    const message = JSON.stringify({
        tipo: 'usuarios_activos',
        type: 'active_users',
        usuarios: activeUsersList,
        users: activeUsersList
    });
    
    activeUsers.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
    
    console.log(`📊 Usuarios activos: ${activeUsersList.length}`);
}

// =======================================
// INICIAR SERVIDOR
// =======================================

server.listen(PORT, () => {
    console.log(`🌍 Servidor activo en puerto ${PORT}`);
    console.log(`📡 WebSocket server integrado`);
    console.log(`🔗 URL local: http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, 'frontend')}`);
    console.log('✅ Listo para conexiones');
});

// Manejo de errores del servidor
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} ya está en uso`);
        process.exit(1);
    } else {
        console.error('❌ Error del servidor:', error);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Estadísticas cada 5 minutos
setInterval(() => {
    console.log(`📊 Estado del servidor:`);
    console.log(`   - Usuarios registrados: ${users.size}`);
    console.log(`   - Mensajes totales: ${messages.length}`);
    console.log(`   - Conexiones activas: ${activeUsers.size}`);
}, 5 * 60 * 1000);
