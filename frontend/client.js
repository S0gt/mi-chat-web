// ========================================
// MI CHAT WEB - CLIENTE PARA RENDER
// ========================================

console.log('🚀 Iniciando Mi Chat Web (Render)...');

// Variables globales
let ws = null;
let wsReconnectAttempts = 0;
let wsMaxReconnectAttempts = 5;
let usuarioSeleccionado = null;
let grupoSeleccionado = null;
let currentUser = null;
let isTyping = false;
let typingTimeout = null;

// Detectar si estamos en producción o desarrollo
const isProduction = window.location.hostname !== 'localhost';
const WS_URL = isProduction 
  ? `wss://${window.location.host}` 
  : 'ws://localhost:3000';

console.log('🌐 Entorno:', isProduction ? 'Producción' : 'Desarrollo');
console.log('🔌 WebSocket URL:', WS_URL);

// Configuración inicial
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔧 DOM cargado, inicializando aplicación...');
  await inicializarAplicacion();
});

// ========================================
// INICIALIZACIÓN PRINCIPAL
// ========================================

async function inicializarAplicacion() {
  try {
    console.log('🔍 Verificando sesión...');
    
    // Verificar sesión
    const sessionInfo = await obtenerInfoSesion();
    if (!sessionInfo.logueado) {
      console.log('❌ No hay sesión activa');
      window.location.href = 'login.html';
      return;
    }
    
    currentUser = sessionInfo;
    console.log('✅ Usuario logueado:', currentUser.usuario);
    
    // Configurar interfaz
    initTheme();
    setupEventListeners();
    
    // Cargar datos
    await cargarUsuarios();
    
    // Conectar WebSocket
    setupWebSocket();
    
    console.log('🎉 Aplicación inicializada correctamente');
    showToast('success', '¡Bienvenido a Mi Chat Web!');
    
  } catch (error) {
    console.error('❌ Error al inicializar aplicación:', error);
    showToast('error', 'Error al cargar la aplicación');
  }
}

// ========================================
// VERIFICACIÓN DE SESIÓN
// ========================================

async function obtenerInfoSesion() {
  try {
    const response = await fetch('/api/sesion');
    const data = await response.json();
    console.log('📊 Datos de sesión:', data);
    return data;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return { logueado: false };
  }
}

// ========================================
// TEMA
// ========================================

function initTheme() {
  const savedTheme = localStorage.getItem('chatTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  console.log('🎨 Tema aplicado:', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('chatTheme', newTheme);
  console.log('🎨 Tema cambiado a:', newTheme);
}

// ========================================
// WEBSOCKET - SIMPLIFICADO
// ========================================

function setupWebSocket() {
  try {
    console.log('🔌 Conectando WebSocket...');
    ws = new WebSocket(WS_URL);
    
    ws.onopen = function() {
      console.log('✅ WebSocket conectado');
      showToast('success', 'Conectado al servidor en tiempo real');
      wsReconnectAttempts = 0;
      
      // Registrar usuario
      if (currentUser) {
        const loginData = {
          tipo: 'login',
          userId: currentUser.usuario_id,
          username: currentUser.usuario
        };
        ws.send(JSON.stringify(loginData));
        console.log('👤 Usuario registrado en WebSocket');
      }
    };
    
    ws.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Mensaje WebSocket recibido:', data.tipo);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error procesando mensaje WebSocket:', error);
      }
    };
    
    ws.onclose = function(event) {
      console.log('🔌 WebSocket desconectado, código:', event.code);
      
      // Intentar reconexión si no fue cierre intencional
      if (event.code !== 1000 && wsReconnectAttempts < wsMaxReconnectAttempts) {
        wsReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
        console.log(`🔄 Reintentando conexión en ${delay}ms...`);
        setTimeout(setupWebSocket, delay);
      } else if (wsReconnectAttempts >= wsMaxReconnectAttempts) {
        showToast('error', 'No se pudo conectar al servidor');
      }
    };
    
    ws.onerror = function(error) {
      console.error('❌ Error WebSocket:', error);
      if (wsReconnectAttempts === 0) {
        showToast('warning', 'Problema de conexión - Verifica que el servidor esté iniciado');
      }
    };
    
  } catch (error) {
    console.error('❌ Error configurando WebSocket:', error);
    showToast('error', 'Error al conectar con el servidor');
  }
}

function handleWebSocketMessage(data) {
  switch (data.tipo) {
    case 'login_success':
      console.log('✅ Login confirmado por el servidor');
      break;
      
    case 'mensaje':
      console.log('📨 Mensaje recibido');
      if (data.grupo_id) {
        // Mensaje de grupo
        if (grupoSeleccionado && grupoSeleccionado.id == data.grupo_id) {
          mostrarMensajeEnChat(data, true);
        }
      } else {
        // Mensaje privado
        if (usuarioSeleccionado && 
           (usuarioSeleccionado.id == data.de || usuarioSeleccionado.id == data.para)) {
          mostrarMensajeEnChat(data, false);
        }
      }
      break;
      
    case 'typing':
      mostrarIndicadorEscritura(data);
      break;
      
    case 'call-offer':
    case 'call-answer':
    case 'ice-candidate':
    case 'call-end':
      console.log('📞 Evento de llamada recibido:', data.tipo);
      // Implementar llamadas más tarde si es necesario
      break;
      
    default:
      console.log('🔍 Tipo de mensaje no reconocido:', data.tipo);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  console.log('🔧 Configurando event listeners...');
  
  // Tema
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.onclick = toggleTheme;
  }
  
  // Input de mensaje
  const input = document.getElementById('input');
  if (input) {
    input.addEventListener('keypress', handleMessageInput);
    input.addEventListener('input', handleTyping);
  }
  
  // Botón enviar
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.onclick = enviarMensaje;
  }
  
  // Botón agregar usuario
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.onclick = mostrarModalAgregarUsuario;
  }
  
  console.log('✅ Event listeners configurados');
}

// ========================================
// MANEJO DE MENSAJES
// ========================================

async function handleMessageInput(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    await enviarMensaje();
  }
}

function handleTyping() {
  if (!usuarioSeleccionado && !grupoSeleccionado) return;
  
  if (!isTyping) {
    isTyping = true;
    enviarIndicadorEscribiendo(true);
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    enviarIndicadorEscribiendo(false);
  }, 2000);
}

async function enviarMensaje() {
  const input = document.getElementById('input');
  const mensaje = input.value.trim();
  
  if (!mensaje) return;
  
  if (!usuarioSeleccionado && !grupoSeleccionado) {
    showToast('warning', 'Selecciona un chat primero');
    return;
  }
  
  try {
    let endpoint, data;
    
    if (usuarioSeleccionado) {
      // Mensaje privado
      endpoint = '/api/send_message';
      data = {
        receptor_id: usuarioSeleccionado.id,
        mensaje: mensaje
      };
    } else if (grupoSeleccionado) {
      // Mensaje de grupo
      endpoint = '/api/send_grupo_message';
      data = {
        grupo_id: grupoSeleccionado.id,
        mensaje: mensaje
      };
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Limpiar input
      input.value = '';
      
      // Enviar por WebSocket si está conectado
      if (ws && ws.readyState === WebSocket.OPEN) {
        const wsData = {
          tipo: 'mensaje',
          mensaje: mensaje,
          de: currentUser.usuario_id,
          timestamp: new Date().toISOString()
        };
        
        if (usuarioSeleccionado) {
          wsData.para = usuarioSeleccionado.id;
        } else if (grupoSeleccionado) {
          wsData.grupo_id = grupoSeleccionado.id;
        }
        
        ws.send(JSON.stringify(wsData));
      }
      
      // Recargar mensajes
      if (usuarioSeleccionado) {
        await cargarMensajes(usuarioSeleccionado.id);
      } else if (grupoSeleccionado) {
        await cargarMensajesGrupo(grupoSeleccionado.id);
      }
      
    } else {
      showToast('error', result.error || 'Error al enviar mensaje');
    }
    
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    showToast('error', 'Error de conexión');
  }
}

function enviarIndicadorEscribiendo(escribiendo) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
  const data = {
    tipo: 'typing',
    escribiendo: escribiendo,
    de: currentUser.usuario_id
  };
  
  if (usuarioSeleccionado) {
    data.para = usuarioSeleccionado.id;
  } else if (grupoSeleccionado) {
    data.grupo_id = grupoSeleccionado.id;
  }
  
  ws.send(JSON.stringify(data));
}

// ========================================
// CARGAR DATOS
// ========================================

async function cargarUsuarios() {
  try {
    console.log('👥 Cargando usuarios...');
    const response = await fetch('/api/users');
    const data = await response.json();
    
    if (data.success) {
      mostrarUsuarios(data.users);
      console.log(`✅ ${data.users.length} usuarios cargados`);
    } else {
      console.error('Error cargando usuarios:', data.error);
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    showToast('error', 'Error al cargar usuarios');
  }
}

function mostrarUsuarios(usuarios) {
  const lista = document.getElementById('usuarios');
  if (!lista) return;
  
  lista.innerHTML = '';
  
  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="user-item" onclick="seleccionarUsuario(${usuario.id}, '${usuario.usuario}')">
        <div class="user-avatar">
          <img src="${usuario.avatar || '../uploads/default-avatar.png'}" alt="${usuario.usuario}">
        </div>
        <div class="user-info">
          <div class="user-name">${usuario.usuario}</div>
          <div class="user-status">En línea</div>
        </div>
      </div>
    `;
    lista.appendChild(li);
  });
}

function seleccionarUsuario(id, username) {
  usuarioSeleccionado = { id, nombre: username };
  grupoSeleccionado = null;
  
  console.log('👤 Usuario seleccionado:', username);
  
  // Actualizar interfaz
  const chatHeader = document.getElementById('chatHeader');
  if (chatHeader) {
    chatHeader.textContent = username;
  }
  
  // Cargar mensajes
  cargarMensajes(id);
  
  // Activar input
  const input = document.getElementById('input');
  if (input) {
    input.disabled = false;
    input.placeholder = `Escribe un mensaje a ${username}...`;
  }
}

async function cargarMensajes(userId) {
  try {
    const response = await fetch(`/api/messages?user_id=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      mostrarMensajes(data.messages);
    }
  } catch (error) {
    console.error('Error cargando mensajes:', error);
  }
}

async function cargarMensajesGrupo(grupoId) {
  try {
    const response = await fetch(`/api/grupo_messages?grupo_id=${grupoId}`);
    const data = await response.json();
    
    if (data.success) {
      mostrarMensajes(data.messages);
    }
  } catch (error) {
    console.error('Error cargando mensajes de grupo:', error);
  }
}

function mostrarMensajes(mensajes) {
  const messagesContainer = document.getElementById('messages');
  if (!messagesContainer) return;
  
  messagesContainer.innerHTML = '';
  
  mensajes.forEach(mensaje => {
    mostrarMensajeEnChat(mensaje, !!mensaje.grupo_id);
  });
  
  // Scroll al final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function mostrarMensajeEnChat(mensaje, esGrupo) {
  const messagesContainer = document.getElementById('messages');
  if (!messagesContainer) return;
  
  const div = document.createElement('div');
  const esPropio = currentUser && 
    (mensaje.emisor_id == currentUser.usuario_id || mensaje.de == currentUser.usuario_id);
  
  div.className = `message ${esPropio ? 'own' : 'other'}`;
  
  let contenido = `
    <div class="message-content">
      <div class="message-text">${mensaje.mensaje}</div>
      <div class="message-time">${formatearTiempo(mensaje.fecha_envio || mensaje.timestamp)}</div>
    </div>
  `;
  
  if (esGrupo && !esPropio) {
    contenido = `
      <div class="message-content">
        <div class="message-sender">${mensaje.emisor || mensaje.username}</div>
        <div class="message-text">${mensaje.mensaje}</div>
        <div class="message-time">${formatearTiempo(mensaje.fecha_envio || mensaje.timestamp)}</div>
      </div>
    `;
  }
  
  div.innerHTML = contenido;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function mostrarIndicadorEscritura(data) {
  console.log('⌨️ Indicador de escritura:', data);
  // Implementar indicador visual si es necesario
}

// ========================================
// MODAL AGREGAR USUARIO
// ========================================

function mostrarModalAgregarUsuario() {
  console.log('👥 Mostrando modal agregar usuario');
  // Implementar modal si existe en el HTML
}

// ========================================
// UTILIDADES
// ========================================

function formatearTiempo(fecha) {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function showToast(type, message) {
  console.log(`📢 [${type.toUpperCase()}] ${message}`);
  
  // Crear toast visual si no existe
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  
  // Aplicar estilo según tipo
  const colors = {
    success: '#25d366',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };
  
  toast.style.backgroundColor = colors[type] || colors.info;
  toast.textContent = message;
  toast.style.transform = 'translateX(0)';
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
  }, 3000);
}

console.log('✅ Cliente JavaScript cargado correctamente');
