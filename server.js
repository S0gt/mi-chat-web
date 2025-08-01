const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

console.log('🚀 Iniciando Mi Chat Web para Render...');
console.log('📊 Estadísticas de DB:', db.getStats());

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
                logueado: true,
                user_id: user.id,
                usuario: user.usuario,
                email: user.email
            });
        } else {
            console.log('❌ Login fallido:', usuario);
            res.json({ 
                success: false, 
                logueado: false,
                error: 'Credenciales incorrectas' 
            });
        }
    } catch (error) {
        console.log('❌ Error en login:', error.message);
        res.json({ success: false, error: 'Error del servidor' });
    }
});

// API para verificar sesión
app.get('/api/sesion', (req, res) => {
    // Para esta implementación simple, la sesión se maneja en el frontend
    // El cliente verificará localStorage y enviará los datos necesarios
    res.json({ 
        logueado: true,  // Cambiar a true para que client.js funcione
        message: 'Sesión verificada en cliente'
    });
});

// Endpoint para obtener mensajes
app.get('/api/messages', (req, res) => {
  const messages = db.getAllMessages();
  console.log(`📨 Devolviendo ${messages.length} mensajes`);
  res.json({ success: true, messages: messages });
});

// Endpoint para obtener usuarios
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, error: 'Error obteniendo usuarios' });
    }
});

// Endpoint para obtener amigos del usuario actual
app.get('/api/friends', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.json({ success: false, error: 'Username requerido' });
  }
  
  const friends = db.getFriends(username);
  const friendsData = friends.map(friendName => {
    const user = db.users.get(friendName);
    return user ? {
      id: user.id,
      usuario: user.usuario,
      email: user.email,
      avatar: user.avatar,
      ultimo_acceso: user.ultimo_acceso
    } : null;
  }).filter(Boolean);
  
  console.log(`👥 ${username} tiene ${friendsData.length} amigos`);
  res.json({ success: true, friends: friendsData });
});

// Endpoint para agregar amigo
app.post('/api/add-friend', (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    
    if (!username || !friendUsername) {
      return res.json({ success: false, error: 'Username y friendUsername requeridos' });
    }
    
    db.addFriend(username, friendUsername);
    res.json({ success: true, message: 'Amigo agregado exitosamente' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Endpoint para remover amigo
app.post('/api/remove-friend', (req, res) => {
  try {
    const { username, friendUsername } = req.body;
    
    if (!username || !friendUsername) {
      return res.json({ success: false, error: 'Username y friendUsername requeridos' });
    }
    
    db.removeFriend(username, friendUsername);
    res.json({ success: true, message: 'Amigo removido exitosamente' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// API para obtener mensajes
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await db.getMessages(50);
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, error: 'Error obteniendo mensajes' });
    }
});

// API para enviar mensaje
app.post('/api/send_message', async (req, res) => {
    const { usuario, mensaje, destinatario } = req.body;
    
    console.log('📤 Enviando mensaje:', { usuario, destinatario, mensaje: mensaje.substring(0, 50) + '...' });
    
    try {
        const savedMessage = await db.saveMessage({ usuario, mensaje });
        
        // Broadcast via WebSocket
        if (wss) {
            const messageData = {
                type: 'message',
                data: savedMessage
            };
            
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageData));
                }
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Mensaje enviado',
            message_id: savedMessage.id
        });
    } catch (error) {
        console.log('❌ Error enviando mensaje:', error.message);
        res.json({ success: false, error: 'Error enviando mensaje' });
    }
});

// Ruta principal que sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// =======================================
// WEBSOCKET SERVER
// =======================================

console.log('🔌 Configurando WebSocket Server...');

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('🔗 Nueva conexión WebSocket desde:', req.socket.remoteAddress);
    
    let connectedUser = null;
    
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            console.log('📨 Mensaje WebSocket recibido:', message.tipo || message.type, 'de:', message.usuario || message.username);
            
            switch (message.tipo || message.type) {  // Aceptar tanto tipo como type
                case 'join':
                case 'login':  // Agregar login como alias de join
                    connectedUser = message.usuario || message.username;
                    db.setUserActive(connectedUser, ws);
                    
                    // Enviar usuarios activos
                    const activeUsers = db.getActiveUsers();
                    ws.send(JSON.stringify({
                        type: 'users_update',
                        users: activeUsers
                    }));
                    
                    // Broadcast nuevo usuario conectado
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'user_connected',
                                usuario: connectedUser
                            }));
                        }
                    });
                    break;
                    
                case 'message':
                    if (connectedUser) {
                        const savedMessage = await db.saveMessage({
                            usuario: connectedUser,
                            mensaje: message.mensaje
                        });
                        
                        // Broadcast mensaje a todos
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'message',
                                    data: savedMessage
                                }));
                            }
                        });
                    }
                    break;
                    
                case 'typing':
                    if (connectedUser) {
                        // Reenviar notificación de escritura
                        wss.clients.forEach(client => {
                            if (client !== ws && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'typing',
                                    usuario: connectedUser,
                                    typing: message.typing
                                }));
                            }
                        });
                    }
                    break;
            }
        } catch (error) {
            console.log('❌ Error procesando mensaje WebSocket:', error.message);
        }
    });
    
    ws.on('close', () => {
        if (connectedUser) {
            console.log('👋 Usuario desconectado:', connectedUser);
            db.setUserInactive(connectedUser);
            
            // Broadcast usuario desconectado
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'user_disconnected',
                        usuario: connectedUser
                    }));
                }
            });
        }
    });
    
    ws.on('error', (error) => {
        console.log('❌ Error WebSocket:', error.message);
    });
});

// =======================================
// INICIAR SERVIDOR
// =======================================

server.listen(PORT, () => {
    console.log('');
    console.log('🎉 ¡Mi Chat Web está funcionando!');
    console.log('📡 Servidor HTTP en puerto:', PORT);
    console.log('🔌 WebSocket Server activo');
    console.log('🌐 URL Local: http://localhost:' + PORT);
    console.log('👥 Usuarios de prueba:');
    console.log('   - admin / admin123');
    console.log('   - test / test123');
    console.log('');
});

module.exports = { app, server, wss };
