const CONFIG = {
    API_URL: 'https://api.qcomemos.com',
    DEFAULT_LANG: 'es',
    THEME_KEY: 'qcomemos_theme',
    LANG_KEY: 'qcomemos_lang',
    USER_KEY: 'qcomemos_user'
};

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);