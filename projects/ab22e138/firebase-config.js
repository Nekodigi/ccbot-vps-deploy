(function() {
    'use strict';
    const { initializeApp, getFirestore, getVertexAI, getGenerativeModel } = window.firebaseModules;
    const firebaseConfig = {
        apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
        authDomain: "sandbox-35d1d.firebaseapp.com",
        projectId: "sandbox-35d1d",
        storageBucket: "sandbox-35d1d.appspot.com",
        messagingSenderId: "906287459396",
        appId: "1:906287459396:web:c931c95d943157cae36011",
        measurementId: "G-LE2Q0XC7B6"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const vertexAI = getVertexAI(app);
    window.firebaseApp = app;
    window.db = db;
    window.vertexAI = vertexAI;
    window.getGenerativeModel = getGenerativeModel;
    console.log('Firebase initialized successfully');
})();
