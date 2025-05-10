// firebase-config.js

// Sua configuração do Firebase (firebaseConfig)
const firebaseConfig = {
  apiKey: "AIzaSyAqCioW5vmmNbWi6gOuZpW1tA5OMVj6ndY", // Verifique se esta chave é a correta
  authDomain: "questoes-ineditas.firebaseapp.com",
  projectId: "questoes-ineditas",
  storageBucket: "questoes-ineditas.appspot.com", // ou "questoes-ineditas.firebasestorage.app"
  messagingSenderId: "552494883819",
  appId: "1:552494883819:web:aa50c7ed0874c607d3afae"
};

// Initialize Firebase usando o objeto 'firebase' global.
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Exporte para usar em outros arquivos (módulos).
export { app, auth, db };