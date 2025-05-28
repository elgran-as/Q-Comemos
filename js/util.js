const Utils = {
    // Theme handling
    toggleTheme: function() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
        return isDark;
    },

    // Language handling
    toggleLanguage: function() {
        const currentLang = localStorage.getItem(CONFIG.LANG_KEY) || CONFIG.DEFAULT_LANG;
        const newLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem(CONFIG.LANG_KEY, newLang);
        return newLang;
    },

    // Loading spinner
    showLoading: function() {
        document.getElementById('loadingSpinner').classList.add('active');
    },

    hideLoading: function() {
        document.getElementById('loadingSpinner').classList.remove('active');
    },

    // Search handling
    toggleSearch: function() {
        document.getElementById('searchOverlay').classList.toggle('active');
    }
};