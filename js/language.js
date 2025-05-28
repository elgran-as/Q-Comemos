document.addEventListener('DOMContentLoaded', function() {
    const languageButtons = document.querySelectorAll('[data-lang]');
    
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.dataset.lang;
            setLanguage(lang);
        });
    });
});

function setLanguage(lang) {
    // Store the selected language
    localStorage.setItem('preferred-language', lang);
    
    // Reload the page to apply changes
    location.reload();
}