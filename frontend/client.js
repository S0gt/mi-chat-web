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
    // Verificar localStorage primero
    const usuario = localStorage.getItem('usuario');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user_id = localStorage.getItem('user_id');
    
    console.log('🔍 Verificando localStorage:', {usuario, isLoggedIn, user_id});
    
    if (usuario && isLoggedIn === 'true') {
      console.log('✅ Sesión encontrada en localStorage');
      return {
        logueado: true,
        usuario: usuario,
        usuario_id: parseInt(user_id) || 0  // Cambiar user_id por usuario_id
      };
    }
    
    console.log('❌ No hay sesión en localStorage');
    return { logueado: false };
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
    console.log('✅ Theme toggle configurado');
  }
  
  // Input de mensaje
  const input = document.getElementById('input');
  if (input) {
    input.addEventListener('keypress', handleMessageInput);
    input.addEventListener('input', handleTyping);
    console.log('✅ Input de mensaje configurado');
  }
  
  // Botón enviar
  const sendBtn = document.getElementById('enviar');
  if (sendBtn) {
    sendBtn.onclick = enviarMensaje;
    console.log('✅ Botón enviar configurado');
  }
  
  // Cerrar sesión
  const cerrarSesion = document.getElementById('cerrarSesion');
  if (cerrarSesion) {
    cerrarSesion.onclick = () => {
      localStorage.clear();
      window.location.href = 'login.html';
    };
    console.log('✅ Cerrar sesión configurado');
  }
  
  // Dropdown del menú
  const menuBtn = document.getElementById('menuBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (menuBtn && dropdownMenu) {
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    };
    
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });
    console.log('✅ Dropdown menú configurado');
  }
  
  // Dropdown del botón agregar
  const addButton = document.getElementById('addButton');
  const addDropdown = document.getElementById('addDropdown');
  if (addButton && addDropdown) {
    addButton.onclick = (e) => {
      e.stopPropagation();
      addDropdown.classList.toggle('show');
    };
    
    document.addEventListener('click', () => {
      addDropdown.classList.remove('show');
    });
    console.log('✅ Dropdown agregar configurado');
  }
  
  // Actualizar avatar del usuario en el header
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar && currentUser) {
    userAvatar.textContent = currentUser.usuario.charAt(0).toUpperCase();
  }

  // === BOTONES DE LOS DROPDOWNS ===
  
  // Botones del menú principal (dropdownMenu)
  const perfilBtn = document.getElementById('perfilBtn');
  const configBtn = document.getElementById('configBtn');
  const personalizarBtn = document.getElementById('personalizarBtn');
  
  if (perfilBtn) {
    perfilBtn.onclick = () => {
      console.log('🙋‍♂️ Perfil clickeado');
      showToast('info', 'Abriendo perfil...');
      // TODO: Implementar ventana de perfil
    };
  }
  
  if (configBtn) {
    configBtn.onclick = () => {
      console.log('⚙️ Configuración clickeada');
      showToast('info', 'Abriendo configuración...');
      // TODO: Implementar ventana de configuración
    };
  }
  
  if (personalizarBtn) {
    personalizarBtn.onclick = () => {
      console.log('🎨 Personalizar clickeado');
      showToast('info', 'Abriendo personalización...');
      // TODO: Implementar ventana de personalización
    };
  }
  
  // Botones del menú agregar (addDropdown)
  const iniciarChat = document.getElementById('iniciarChat');
  const agregarUsuario = document.getElementById('agregarUsuario');
  const crearGrupo = document.getElementById('crearGrupo');
  
  if (iniciarChat) {
    iniciarChat.onclick = () => {
      console.log('💬 Iniciar chat clickeado');
      mostrarModalAgregarAmigo();
    };
  }
  
  if (agregarUsuario) {
    agregarUsuario.onclick = () => {
      console.log('👤 Agregar usuario clickeado');
      mostrarModalAgregarAmigo();
    };
  }
  
  if (crearGrupo) {
    crearGrupo.onclick = () => {
      console.log('👥 Crear grupo clickeado');
      showToast('info', 'Función de grupos próximamente...');
      // TODO: Implementar creación de grupos
    };
  }
  
  console.log('✅ Event listeners configurados completamente');
}

// ========================================
// SISTEMA DE AMIGOS
// ========================================

async function mostrarModalAgregarAmigo() {
  const username = prompt('🤝 Ingresa el nombre de usuario que quieres agregar como amigo:');
  
  if (!username) return;
  
  if (username === currentUser.usuario) {
    showToast('error', 'No puedes agregarte a ti mismo como amigo');
    return;
  }
  
  try {
    const response = await fetch('/api/add-friend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: currentUser.usuario,
        friendUsername: username
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', `¡${username} agregado como amigo!`);
      await cargarUsuarios(); // Recargar la lista
    } else {
      showToast('error', `Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error agregando amigo:', error);
    showToast('error', 'Error al agregar amigo');
  }
}

async function removerAmigo(friendUsername) {
  if (!confirm(`¿Estás seguro de que quieres remover a ${friendUsername} de tus amigos?`)) {
    return;
  }
  
  try {
    const response = await fetch('/api/remove-friend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: currentUser.usuario,
        friendUsername: friendUsername
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('success', `${friendUsername} removido de tus amigos`);
      await cargarUsuarios(); // Recargar la lista
      
      // Si estaba chateando con ese amigo, limpiar chat
      if (usuarioSeleccionado && usuarioSeleccionado.nombre === friendUsername) {
        usuarioSeleccionado = null;
        const chatHeader = document.getElementById('chatHeader');
        const inputContainer = document.getElementById('inputContainer');
        if (chatHeader) chatHeader.style.display = 'none';
        if (inputContainer) inputContainer.style.display = 'none';
        document.getElementById('mensajes').innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Selecciona un amigo para chatear</div>';
      }
    } else {
      showToast('error', `Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Error removiendo amigo:', error);
    showToast('error', 'Error al remover amigo');
  }
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
  
  console.log('📤 Enviando mensaje:', mensaje);
  
  try {
    // Para esta implementación simple, usar la API de send_message
    const response = await fetch('/api/send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: currentUser.usuario,
        mensaje: mensaje,
        destinatario: usuarioSeleccionado ? usuarioSeleccionado.nombre : null
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Limpiar input
      input.value = '';
      
      // Mostrar mensaje inmediatamente
      const nuevoMensaje = {
        usuario: currentUser.usuario,
        mensaje: mensaje,
        fecha: new Date().toISOString(),
        tipo: 'texto'
      };
      mostrarMensajeEnChat(nuevoMensaje, false);
      
      // Enviar por WebSocket si está conectado
      if (ws && ws.readyState === WebSocket.OPEN) {
        const wsData = {
          tipo: 'mensaje',
          mensaje: mensaje,
          usuario: currentUser.usuario,
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(wsData));
      }
      
      console.log('✅ Mensaje enviado correctamente');
      
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
    console.log('👥 Cargando amigos...');
    
    if (!currentUser) {
      console.error('❌ No hay usuario actual para cargar amigos');
      return;
    }
    
    const response = await fetch(`/api/friends?username=${currentUser.usuario}`);
    const data = await response.json();
    
    if (data.success) {
      mostrarUsuarios(data.friends);
      console.log(`✅ ${data.friends.length} amigos cargados`);
    } else {
      console.error('Error cargando amigos:', data.error);
      showToast('error', 'Error cargando lista de amigos');
    }
  } catch (error) {
    console.error('Error cargando amigos:', error);
    showToast('error', 'Error al cargar amigos');
  }
}

function mostrarUsuarios(usuarios) {
  const lista = document.getElementById('listaChats');  // Cambiar usuarios por listaChats
  if (!lista) return;
  
  lista.innerHTML = '';
  
  if (usuarios.length === 0) {
    lista.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
        <p>🤝 No tienes amigos agregados</p>
        <p style="font-size: 12px; margin-top: 8px;">Usa el botón + para agregar amigos</p>
      </div>
    `;
    return;
  }
  
  usuarios.forEach(usuario => {
    // No mostrar el usuario actual en la lista
    if (currentUser && usuario.usuario === currentUser.usuario) return;
    
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.onclick = () => seleccionarUsuario(usuario.id, usuario.usuario);
    div.innerHTML = `
      <div class="chat-avatar">${usuario.usuario.charAt(0).toUpperCase()}</div>
      <div class="chat-info">
        <div class="chat-name">${usuario.usuario}</div>
        <div class="chat-last-message">Toca para chatear</div>
      </div>
      <div class="chat-time">
        <span>ahora</span>
        <button class="remove-friend-btn" onclick="event.stopPropagation(); removerAmigo('${usuario.usuario}')" title="Remover amigo">
          ❌
        </button>
      </div>
    `;
    lista.appendChild(div);
  });
}

function seleccionarUsuario(id, username) {
  usuarioSeleccionado = { id, nombre: username };
  grupoSeleccionado = null;
  
  console.log('👤 Usuario seleccionado:', username);
  
  // Mostrar el header del chat
  const chatHeader = document.getElementById('chatHeader');
  if (chatHeader) {
    chatHeader.style.display = 'flex';
  }
  
  // Actualizar nombre del usuario
  const chatUserName = document.getElementById('chatUserName');
  if (chatUserName) {
    chatUserName.textContent = username;
  }
  
  // Actualizar avatar del usuario
  const chatUserAvatar = document.getElementById('chatUserAvatar');
  if (chatUserAvatar) {
    chatUserAvatar.textContent = username.charAt(0).toUpperCase();
  }
  
  // Mostrar el contenedor de input
  const inputContainer = document.getElementById('inputContainer');
  if (inputContainer) {
    inputContainer.style.display = 'flex';
  }
  
  // Ocultar welcome screen
  const mensajes = document.getElementById('mensajes');
  if (mensajes) {
    mensajes.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Cargando mensajes...</div>';
  }
  
  // Activar input
  const input = document.getElementById('input');
  if (input) {
    input.disabled = false;
    input.placeholder = `Escribe un mensaje a ${username}...`;
    input.focus();
  }
  
  // Marcar como activo en la lista
  document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
  event.target.closest('.chat-item').classList.add('active');
  
  // Cargar mensajes
  cargarMensajes(id);
}

async function cargarMensajes(userId) {
  try {
    console.log('📥 Cargando mensajes para usuario:', userId);
    
    const response = await fetch('/api/messages');
    const data = await response.json();
    
    if (data.success) {
      // Filtrar mensajes relacionados con el usuario seleccionado
      const mensajesFiltrados = data.messages.filter(msg => 
        msg.usuario === usuarioSeleccionado.nombre || 
        msg.destinatario === usuarioSeleccionado.nombre ||
        msg.de === usuarioSeleccionado.nombre ||
        msg.para === usuarioSeleccionado.nombre
      );
      
      console.log(`📥 ${mensajesFiltrados.length} mensajes cargados`);
      mostrarMensajes(mensajesFiltrados);
    } else {
      console.log('📥 No hay mensajes o error:', data.error);
      mostrarMensajes([]);
    }
  } catch (error) {
    console.error('Error cargando mensajes:', error);
    mostrarMensajes([]);
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
  const messagesContainer = document.getElementById('mensajes');
  if (!messagesContainer) return;
  
  // Limpiar contenedor
  messagesContainer.innerHTML = '';
  
  if (mensajes.length === 0) {
    messagesContainer.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
        <i class="fas fa-comment" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i><br>
        No hay mensajes aún.<br>
        <small>¡Envía el primer mensaje!</small>
      </div>
    `;
    return;
  }
  
  mensajes.forEach(mensaje => {
    mostrarMensajeEnChat(mensaje, !!mensaje.grupo_id);
  });
  
  // Scroll al final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function mostrarMensajeEnChat(mensaje, esGrupo) {
  const messagesContainer = document.getElementById('mensajes');
  if (!messagesContainer) return;
  
  const div = document.createElement('div');
  const esPropio = currentUser && 
    (mensaje.emisor_id == currentUser.usuario_id || mensaje.de == currentUser.usuario_id || mensaje.usuario == currentUser.usuario);
  
  div.className = `message ${esPropio ? 'sent' : 'received'}`;
  
  let contenido = `
    <div class="message-bubble">
      <div class="message-text">${mensaje.mensaje || mensaje.texto || 'Mensaje sin contenido'}</div>
      <div class="message-time">${formatearTiempo(mensaje.fecha_envio || mensaje.fecha || mensaje.timestamp || new Date())}</div>
    </div>
  `;
  
  if (esGrupo && !esPropio) {
    contenido = `
      <div class="message-bubble">
        <div class="message-sender" style="font-weight: bold; font-size: 12px; margin-bottom: 4px; color: var(--primary-color);">
          ${mensaje.emisor || mensaje.username || 'Usuario'}
        </div>
        <div class="message-text">${mensaje.mensaje || mensaje.texto || 'Mensaje sin contenido'}</div>
        <div class="message-time">${formatearTiempo(mensaje.fecha_envio || mensaje.fecha || mensaje.timestamp || new Date())}</div>
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
