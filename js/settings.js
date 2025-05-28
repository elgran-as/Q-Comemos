// Theme handling
function initTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('#themeToggle i').classList.replace('bi-moon-fill', 'bi-sun-fill');
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    const icon = document.querySelector('#themeToggle i');
    icon.classList.toggle('bi-moon-fill');
    icon.classList.toggle('bi-sun-fill');
}

// Language handling
function initLanguage() {
    const currentLang = localStorage.getItem('language') || 'es';
    document.documentElement.lang = currentLang;
    // Additional language-specific content changes can be added here
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    // Additional language-specific content changes can be added here
    window.location.reload();
}

// Initialize settings
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initLanguage();

    // Event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    document.querySelectorAll('[data-lang]').forEach(button => {
        button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });
});