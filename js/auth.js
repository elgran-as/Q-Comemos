document.addEventListener('DOMContentLoaded', () => {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('bi-eye');
            this.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }

    // Social login handlers
    const googleLogin = document.querySelector('.social-login .btn:first-child');
    const facebookLogin = document.querySelector('.social-login .btn:last-child');

    if (googleLogin) {
        googleLogin.addEventListener('click', async () => {
            try {
                document.getElementById('loadingSpinner').classList.add('show');
                // Implement Google login logic here
                // await signInWithGoogle();
            } catch (error) {
                console.error('Google login error:', error);
                alert('Error al iniciar sesión con Google');
            } finally {
                document.getElementById('loadingSpinner').classList.remove('show');
            }
        });
    }

    if (facebookLogin) {
        facebookLogin.addEventListener('click', async () => {
            try {
                document.getElementById('loadingSpinner').classList.add('show');
                // Implement Facebook login logic here
                // await signInWithFacebook();
            } catch (error) {
                console.error('Facebook login error:', error);
                alert('Error al iniciar sesión con Facebook');
            } finally {
                document.getElementById('loadingSpinner').classList.remove('show');
            }
        });
    }
});