@echo off
title Mi Chat Web - Servidor Render
echo ========================================
echo     MI CHAT WEB - SERVIDOR PARA RENDER
echo ========================================
echo.
echo 🚀 Iniciando servidor unificado...
echo.

cd /d "%~dp0"
echo 📍 Directorio: %CD%

if not exist node_modules (
    echo 📦 Instalando dependencias...
    npm install
)

echo 🌐 Iniciando servidor en puerto 3000...
echo 📡 WebSocket integrado
echo.
echo 💻 Abrir: http://localhost:3000
echo.

node "%~dp0server.js"
pause
