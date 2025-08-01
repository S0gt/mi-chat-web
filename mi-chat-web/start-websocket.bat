@echo off
title Mi Chat Web - Servidor WebSocket LIMPIO
echo ========================================
echo     MI CHAT WEB - SERVIDOR WEBSOCKET
echo           VERSION LIMPIA
echo ========================================
echo.
echo 🚀 Iniciando servidor en puerto 45678...
echo.
cd /d "%~dp0"
echo 📍 Directorio actual: %CD%
echo 🔧 Verificando dependencias...
npm list ws >nul 2>&1
if errorlevel 1 (
    echo ❌ Instalando dependencia WebSocket...
    npm install ws
)
echo ✅ Dependencias verificadas
echo.
echo 🌐 Iniciando servidor WebSocket...
node websocket-server.js
pause
