<?php
require 'auth.php';
?>

<h2>Chat (Tiempo real)</h2>
<form id="mensajeForm">
  Destinatario: <input type="text" name="destinatario" id="destinatario" required><br>
  Mensaje: <input type="text" name="mensaje" id="mensaje" required><br>
  <button type="submit">Enviar</button>
</form>

<div id="mensajes"></div>

<script>
const usuario = "<?php echo $_SESSION['usuario']; ?>";
const socket = new WebSocket('ws://localhost:45678');

socket.addEventListener('message', function (event) {
  const data = JSON.parse(event.data);
  const mensajesDiv = document.getElementById('mensajes');
  mensajesDiv.innerHTML += `<p><strong>${data.remitente}</strong>: ${data.mensaje}</p>`;
});

document.getElementById('mensajeForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const destinatario = document.getElementById('destinatario').value;
  const mensaje = document.getElementById('mensaje').value;

  const formData = new FormData();
  formData.append('destinatario', destinatario);
  formData.append('mensaje', mensaje);

  fetch('send_message.php', { method: 'POST', body: formData });

  const msgData = { remitente: usuario, destinatario: destinatario, mensaje: mensaje };
  socket.send(JSON.stringify(msgData));
});
</script>
