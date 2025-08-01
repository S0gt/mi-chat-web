<?php
session_start();
require 'config.php';

function generarCodigo($longitud = 6) {
    return substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, $longitud);
}

$error = '';
$success = '';
$userCode = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = $_POST['usuario'] ?? '';
    $password = $_POST['password'] ?? '';
    $email = $_POST['email'] ?? '';

    if (!$usuario || !$password) {
        $error = 'Por favor, completa todos los campos.';
    } elseif (strlen($usuario) < 3) {
        $error = 'El nombre de usuario debe tener al menos 3 caracteres.';
    } elseif (strlen($password) < 6) {
        $error = 'La contraseña debe tener al menos 6 caracteres.';
    } else {
        // Verifica si el usuario ya existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$usuario]);
        if ($stmt->fetch()) {
            $error = 'Este nombre de usuario ya está en uso.';
        } else {
            $codigo = generarCodigo();
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("INSERT INTO usuarios (usuario, password, codigo, email) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$usuario, $passwordHash, $codigo, $email])) {
                $success = 'Cuenta creada exitosamente.';
                $userCode = $codigo;
                
                // Si es una petición AJAX
                if (isset($_POST['ajax'])) {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => true, 'message' => 'Cuenta creada exitosamente', 'codigo' => $codigo]);
                    exit;
                }
            } else {
                $error = 'Error al crear la cuenta. Inténtalo de nuevo.';
                
                // Si es una petición AJAX
                if (isset($_POST['ajax'])) {
                    header('Content-Type: application/json');
                    echo json_encode(['success' => false, 'message' => 'Error al crear la cuenta']);
                    exit;
                }
            }
        }
    }
    
    // Si hay errores y es una petición AJAX
    if ($error && isset($_POST['ajax'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $error]);
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrarse - Mi Chat Web</title>
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
            width: 100px;
            height: 100px;
            top: 10%;
            left: 15%;
            animation-delay: 0s;
        }
        
        .shape-2 {
            width: 140px;
            height: 140px;
            top: 70%;
            right: 10%;
            animation-delay: 2s;
        }
        
        .shape-3 {
            width: 80px;
            height: 80px;
            bottom: 15%;
            left: 25%;
            animation-delay: 4s;
        }
        
        .shape-4 {
            width: 60px;
            height: 60px;
            top: 40%;
            right: 30%;
            animation-delay: 1s;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-25px) rotate(180deg); opacity: 1; }
        }
        
        .auth-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            width: 100%;
            max-width: 480px;
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
        
        .toggle-password {
            position: absolute;
            right: 15px;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 5px;
            z-index: 2;
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
        
        .success-card {
            background: linear-gradient(135deg, #25d366, #20c997);
            color: white;
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            margin-top: 1rem;
            box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
        }
        
        .success-card h3 {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
        }
        
        .user-code {
            background: rgba(255, 255, 255, 0.2);
            padding: 1rem;
            border-radius: 8px;
            font-size: 1.5rem;
            font-weight: bold;
            letter-spacing: 3px;
            margin: 1rem 0;
        }
        
        .code-note {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .login-link {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .login-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
            color: white;
            text-decoration: none;
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
        
        .password-strength {
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
        }
        
        .password-strength-bar {
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-weak { background: #ef4444; width: 33%; }
        .strength-medium { background: #f59e0b; width: 66%; }
        .strength-strong { background: #22c55e; width: 100%; }
        
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
        <div class="shape shape-4"></div>
    </div>

    <div class="auth-container">
        <div class="auth-header">
            <div class="app-logo">
                <i class="fab fa-whatsapp"></i>
            </div>
            <h1 class="app-title">Mi Chat Web</h1>
            <p class="app-subtitle">Crea tu cuenta gratis</p>
        </div>

        <?php if ($error): ?>
        <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>

        <?php if ($success && $userCode): ?>
        <div class="success-card">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>¡Cuenta creada exitosamente!</h3>
            <p class="code-note">Tu código de usuario es:</p>
            <div class="user-code"><?php echo htmlspecialchars($userCode); ?></div>
            <p class="code-note">Guarda este código, lo necesitarás para que otros usuarios te encuentren.</p>
            <a href="login.php" class="login-link">
                <i class="fas fa-sign-in-alt"></i>
                Iniciar Sesión
            </a>
        </div>
        <?php else: ?>
        <form method="POST" id="registerForm">
            <div class="form-group">
                <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" name="usuario" placeholder="Nombre de usuario" required 
                           value="<?php echo htmlspecialchars($_POST['usuario'] ?? ''); ?>"
                           minlength="3" autocomplete="username">
                </div>
                <small style="color: #666; font-size: 0.85rem; margin-top: 4px; display: block;">
                    Mínimo 3 caracteres
                </small>
            </div>

            <div class="form-group">
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" name="password" placeholder="Contraseña" required 
                           minlength="6" id="password" autocomplete="new-password">
                    <button type="button" class="toggle-password" onclick="togglePassword('password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div class="password-strength">
                    <div class="password-strength-bar" id="strengthBar"></div>
                </div>
                <small style="color: #666; font-size: 0.85rem; margin-top: 4px; display: block;">
                    Mínimo 6 caracteres
                </small>
            </div>

            <div class="form-group">
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" placeholder="Confirmar contraseña" required 
                           minlength="6" id="confirmPassword" autocomplete="new-password">
                    <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>

            <div class="form-options">
                <label class="checkbox-wrapper">
                    <input type="checkbox" id="acceptTerms" required>
                    <span class="checkmark"></span>
                    Acepto los términos y condiciones
                </label>
            </div>

            <button type="submit" class="auth-button" id="submitBtn">
                <i class="fas fa-user-plus"></i>
                Crear Cuenta
            </button>
        </form>

        <div class="auth-links">
            <p>¿Ya tienes cuenta? <a href="login.php">Iniciar sesión aquí</a></p>
        </div>
        <?php endif; ?>
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

        function checkPasswordStrength(password) {
            const strengthBar = document.getElementById('strengthBar');
            let strength = 0;
            
            // Criterios de fortaleza
            if (password.length >= 6) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;
            
            // Aplicar clase según fortaleza
            strengthBar.className = 'password-strength-bar';
            if (strength >= 1 && strength <= 2) {
                strengthBar.classList.add('strength-weak');
            } else if (strength === 3) {
                strengthBar.classList.add('strength-medium');
            } else if (strength >= 4) {
                strengthBar.classList.add('strength-strong');
            }
        }

        function validatePasswordMatch() {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const confirmField = document.getElementById('confirmPassword');
            
            if (confirmPassword && password !== confirmPassword) {
                confirmField.style.borderColor = '#ef4444';
                return false;
            } else if (confirmPassword) {
                confirmField.style.borderColor = '#22c55e';
                return true;
            }
            return true;
        }

        document.getElementById('password')?.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
            validatePasswordMatch();
        });

        document.getElementById('confirmPassword')?.addEventListener('input', function(e) {
            validatePasswordMatch();
        });

        document.getElementById('registerForm')?.addEventListener('submit', function(e) {
            const submitBtn = document.getElementById('submitBtn');
            const usuario = document.querySelector('input[name="usuario"]').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const acceptTerms = document.getElementById('acceptTerms').checked;
            
            // Validaciones del lado del cliente
            if (!usuario || !password || !confirmPassword) {
                e.preventDefault();
                alert('Por favor, completa todos los campos');
                return;
            }
            
            if (usuario.length < 3) {
                e.preventDefault();
                alert('El nombre de usuario debe tener al menos 3 caracteres');
                return;
            }
            
            if (password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Las contraseñas no coinciden');
                return;
            }
            
            if (!acceptTerms) {
                e.preventDefault();
                alert('Debes aceptar los términos y condiciones');
                return;
            }
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
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