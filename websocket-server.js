const WebSocket = require('ws');
const http = require('http');

console.log('🚀 Iniciando Mi Chat Web - Servidor WebSocket...');

// Crear servidor HTTP
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Almacenar conexiones de usuarios
const usuarios = new Map();
let connectionCount = 0;

wss.on('connection', function connection(ws, req) {
  connectionCount++;
  const clientId = `client_${connectionCount}`;
  
  console.log(`🔗 Nueva conexión WebSocket: ${clientId}`);
  
  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message.toString());
      console.log(`📨 [${clientId}] ${data.tipo}`);
    } catch (e) {
      console.error('❌ Error parsing JSON:', e);
      return;
    }
    
    switch (data.tipo) {
      case 'login':
        // Registrar usuario
        ws.userId = data.userId;
        ws.username = data.username;
        usuarios.set(data.userId, ws);
        console.log(`👤 Usuario conectado: ${data.username} (${data.userId})`);
        
        // Confirmar login
        ws.send(JSON.stringify({
          tipo: 'login_success',
          mensaje: 'Conectado correctamente al servidor'
        }));
        break;
        
      case 'mensaje':
        // Mensaje de chat - reenviar al destinatario
        if (data.grupo_id) {
          enviarMensajeGrupo(data);
        } else {
          enviarMensajePrivado(data);
        }
        break;
        
      case 'typing':
        // Indicador de escritura
        if (data.grupo_id) {
          enviarTypingGrupo(data);
        } else {
          enviarTypingPrivado(data);
        }
        break;
        
      case 'call-offer':
      case 'call-answer':
      case 'ice-candidate':
      case 'call-end':
        // Llamadas WebRTC - reenviar al destinatario
        enviarLlamada(data);
        break;
        
      default:
        console.log(`🔍 Tipo de mensaje no reconocido: ${data.tipo}`);
    }
  });
  
  ws.on('close', function(code, reason) {
    if (ws.userId) {
      usuarios.delete(ws.userId);
      console.log(`👋 Usuario ${ws.username} (${ws.userId}) desconectado`);
    } else {
      console.log(`👋 Cliente ${clientId} desconectado`);
    }
  });
  
  ws.on('error', function(error) {
    console.error(`❌ Error en WebSocket [${clientId}]:`, error.message);
  });
});

// Función para enviar mensajes privados
function enviarMensajePrivado(data) {
  const destinatario = usuarios.get(data.para);
  if (destinatario && destinatario.readyState === WebSocket.OPEN) {
    destinatario.send(JSON.stringify(data));
    console.log(`✅ Mensaje privado enviado de ${data.de} a ${data.para}`);
  } else {
    console.log(`⚠️ Destinatario ${data.para} no está conectado`);
  }
}

// Función para enviar mensajes de grupo
function enviarMensajeGrupo(data) {
  usuarios.forEach((ws, userId) => {
    if (userId !== data.de && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
  console.log(`✅ Mensaje de grupo enviado (grupo ${data.grupo_id})`);
}

// Función para indicadores de escritura privados
function enviarTypingPrivado(data) {
  const destinatario = usuarios.get(data.para);
  if (destinatario && destinatario.readyState === WebSocket.OPEN) {
    destinatario.send(JSON.stringify(data));
  }
}

// Función para indicadores de escritura en grupos
function enviarTypingGrupo(data) {
  usuarios.forEach((ws, userId) => {
    if (userId !== data.de && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

// Función para llamadas WebRTC
function enviarLlamada(data) {
  const destinatario = usuarios.get(data.para);
  if (destinatario && destinatario.readyState === WebSocket.OPEN) {
    destinatario.send(JSON.stringify(data));
    console.log(`📞 Evento de llamada ${data.tipo} enviado de ${data.de} a ${data.para}`);
  } else {
    console.log(`⚠️ Usuario ${data.para} no está disponible para llamada`);
  }
}

// Iniciar servidor
const PORT = 45678;
server.listen(PORT, () => {
  console.log(`🌐 Servidor WebSocket activo en puerto ${PORT}`);
  console.log(`📡 Clientes pueden conectar en: ws://localhost:${PORT}`);
  console.log('🔄 Presiona Ctrl+C para detener el servidor');
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso`);
    console.log('💡 Soluciones:');
    console.log('   1. Detén otros procesos en el puerto 45678');
    console.log('   2. Reinicia VS Code o el terminal');
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor WebSocket...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Estadísticas cada 30 segundos
setInterval(() => {
  console.log(`📊 Conexiones activas: ${usuarios.size}`);
}, 30000);
