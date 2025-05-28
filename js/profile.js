// Auth state management
let currentAuthState = localStorage.getItem('isLoggedIn') ? 'profile' : 'login';

// UI Management
function toggleAuthView(view) {
    document.getElementById('loginSection').classList.toggle('d-none', view !== 'login');
    document.getElementById('registerSection').classList.toggle('d-none', view !== 'register');
    document.getElementById('profileContent').classList.toggle('d-none', view !== 'profile');
    currentAuthState = view;
}

// Password visibility toggle
function togglePassword(button) {
    const input = button.previousElementSibling;
    const icon = button.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
    }
}

// Social login handlers
async function loginWithGoogle() {
    try {
        showLoading();
        // Implement Google OAuth login
        await simulateApiCall();
        localStorage.setItem('isLoggedIn', 'true');
        toggleAuthView('profile');
    } catch (error) {
        showError('Error al iniciar sesión con Google');
    } finally {
        hideLoading();
    }
}

async function loginWithFacebook() {
    try {
        showLoading();
        // Implement Facebook OAuth login
        await simulateApiCall();
        localStorage.setItem('isLoggedIn', 'true');
        toggleAuthView('profile');
    } catch (error) {
        showError('Error al iniciar sesión con Facebook');
    } finally {
        hideLoading();
    }
}

// Form handlers
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        showLoading();
        await simulateApiCall();
        localStorage.setItem('isLoggedIn', 'true');
        toggleAuthView('profile');
    } catch (error) {
        showError('Error en el inicio de sesión');
    } finally {
        hideLoading();
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        showLoading();
        const formData = new FormData(this);
        await simulateApiCall();
        localStorage.setItem('isLoggedIn', 'true');
        toggleAuthView('profile');
    } catch (error) {
        showError('Error en el registro');
    } finally {
        hideLoading();
    }
});

// Profile image handling
document.getElementById('avatarUpload').addEventListener('change', async function(e) {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        try {
            showLoading();
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileAvatar').src = e.target.result;
            };
            reader.readAsDataURL(file);
            await simulateApiCall();
            showSuccess('Imagen actualizada correctamente');
        } catch (error) {
            showError('Error al actualizar la imagen');
        } finally {
            hideLoading();
        }
    }
});

// Preferences handling
function savePreferences() {
    try {
        showLoading();
        const preferences = {
            dietary: getDietaryPreferences(),
            medical: getMedicalConditions()
        };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        showSuccess('Preferencias guardadas correctamente');
    } catch (error) {
        showError('Error al guardar las preferencias');
    } finally {
        hideLoading();
    }
}

// Utility functions
function getDietaryPreferences() {
    return Array.from(document.querySelectorAll('.dietary-preferences input:checked'))
        .map(input => input.id);
}

function getMedicalConditions() {
    return Array.from(document.querySelectorAll('.medical-conditions input:checked'))
        .map(input => input.id);
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

function showError(message) {
    // Implement error toast/alert
    alert(message);
}

function showSuccess(message) {
    // Implement success toast/alert
    alert(message);
}

async function simulateApiCall() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Logout handler
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPreferences');
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    toggleAuthView(currentAuthState);
    
    // Load saved preferences
    const savedPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    if (savedPreferences.dietary) {
        savedPreferences.dietary.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (savedPreferences.medical) {
        savedPreferences.medical.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
    }
});