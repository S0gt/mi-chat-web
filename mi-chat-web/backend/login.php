<?php
session_start();
require 'config.php';

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!$usuario || !$password) {
        $error = 'Por favor, completa todos los campos.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ?");
        $stmt->execute([$usuario]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['usuario'] = $usuario;
            $_SESSION['usuario_id'] = $user['id'];
            
            // Si es una petición AJAX
            if (isset($_POST['ajax'])) {
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'message' => 'Login exitoso']);
                exit;
            }
            
            header("Location: ../frontend/index.html");
            exit;
        } else {
            // Si es una petición AJAX
            if (isset($_POST['ajax'])) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
                exit;
            }
            $error = 'Usuario o contraseña incorrectos.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Mi Chat Web</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .bg-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }
        
        .shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 6s ease-in-out infinite;
        }
        
        .shape-1 {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .shape-2 {
            width: 120px;
            height: 120px;
            top: 60%;
            right: 15%;
            animation-delay: 2s;
        }
        
        .shape-3 {
            width: 60px;
            height: 60px;
            bottom: 20%;
            left: 20%;
            animation-delay: 4s;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        
        .auth-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
        }
        
        .auth-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .app-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #25d366, #20c997);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2.5rem;
            color: white;
            box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
        }
        
        .app-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            background: linear-gradient(135deg, #333, #666);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .app-subtitle {
            color: #666;
            margin: 0 0 2rem 0;
            font-size: 1rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .input-icon {
            position: absolute;
            left: 15px;
            color: #999;
            z-index: 2;
        }
        
        .input-wrapper input {
            width: 100%;
            padding: 15px 15px 15px 45px;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }
        
        .input-wrapper input:focus {
            outline: none;
            border-color: #25d366;
            box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
        }
        
        .auth-button {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #25d366, #20c997);
            color: white;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .auth-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }
        
        .auth-button:active {
            transform: translateY(0);
        }
        
        .auth-links {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
        }
        
        .auth-links a {
            color: #25d366;
            text-decoration: none;
            font-weight: 500;
        }
        
        .auth-links a:hover {
            text-decoration: underline;
        }
        
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid;
            animation: slideIn 0.3s ease;
        }
        
        .alert-error {
            background: #fef2f2;
            border-color: #ef4444;
            color: #dc2626;
        }
        
        .alert-success {
            background: #f0fdf4;
            border-color: #22c55e;
            color: #16a34a;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .loading {
            pointer-events: none;
            opacity: 0.7;
        }
        
        @media (max-width: 480px) {
            .auth-container {
                margin: 1rem;
                padding: 2rem 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
    </div>

    <div class="auth-container">
        <div class="auth-header">
            <div class="app-logo">
                <i class="fab fa-whatsapp"></i>
            </div>
            <h1 class="app-title">Mi Chat Web</h1>
            <p class="app-subtitle">Bienvenido de vuelta</p>
        </div>

        <?php if ($error): ?>
        <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>

        <form method="POST" id="loginForm">
            <div class="form-group">
                <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" name="usuario" placeholder="Nombre de usuario" required 
                           value="<?php echo htmlspecialchars($_POST['usuario'] ?? ''); ?>"
                           autocomplete="username">
                </div>
            </div>

            <div class="form-group">
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" name="password" placeholder="Contraseña" required
                           autocomplete="current-password" id="passwordField">
                    <button type="button" class="toggle-password" onclick="togglePassword('passwordField')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>

            <div class="form-options">
                <label class="checkbox-wrapper">
                    <input type="checkbox" name="remember" id="rememberMe">
                    <span class="checkmark"></span>
                    Recordarme
                </label>
            </div>

            <button type="submit" class="auth-button" id="submitBtn">
                <i class="fas fa-sign-in-alt"></i>
                Iniciar Sesión
            </button>
        </form>

        <div class="auth-links">
            <p>¿No tienes cuenta? <a href="registro.php">Registrarse aquí</a></p>
        </div>
    </div>

    <script>
        function togglePassword(inputId) {
            const passwordInput = document.getElementById(inputId);
            const toggleIcon = passwordInput.parentElement.querySelector('.toggle-password i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                toggleIcon.className = 'fas fa-eye';
            }
        }

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const submitBtn = document.getElementById('submitBtn');
            const usuario = document.querySelector('input[name="usuario"]').value.trim();
            const password = document.querySelector('input[name="password"]').value.trim();
            
            if (!usuario || !password) {
                e.preventDefault();
                alert('Por favor, completa todos los campos');
                return;
            }
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            submitBtn.classList.add('loading');
        });

        // Agregar efectos de focus a los inputs
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Auto-focus en el primer campo si hay error
        <?php if ($error): ?>
        document.querySelector('input[name="usuario"]').focus();
        <?php endif; ?>
    </script>
</body>
</html>