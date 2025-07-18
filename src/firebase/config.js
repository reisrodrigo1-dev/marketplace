import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase - DireitoHub
const firebaseConfig = {
  apiKey: "AIzaSyCx_pMyomWqvwt959Ow3tniTAGNleyLlNk",
  authDomain: "direitohub-74b76.firebaseapp.com",
  projectId: "direitohub-74b76",
  storageBucket: "direitohub-74b76.firebasestorage.app",
  messagingSenderId: "363573909724",
  appId: "1:363573909724:web:d18bccab20235da9a5fc19",
  measurementId: "G-7PP768GET6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
