# Instrucciones para Git (ejecutar después de instalar Git)

# 1. Inicializar repositorio
git init

# 2. Configurar Git (primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 3. Crear .gitignore
echo "node_modules/" > .gitignore
echo "*.log" >> .gitignore
echo ".env" >> .gitignore

# 4. Agregar archivos
git add .

# 5. Primer commit
git commit -m "Mi Chat Web para Render"

# 6. Crear repositorio en GitHub (ir a github.com/new)
# Nombrar: mi-chat-web

# 7. Conectar con GitHub (reemplazar tu-usuario)
git remote add origin https://github.com/tu-usuario/mi-chat-web.git

# 8. Subir código
git branch -M main
git push -u origin main
