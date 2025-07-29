import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase - Marketplace
const firebaseConfig = {
  apiKey: "AIzaSyDQCSr_Mng9Swc-GVCm02Z4cv-9Yv4ZOz0",
  authDomain: "bipetech-marketplace.firebaseapp.com",
  projectId: "bipetech-marketplace",
  storageBucket: "bipetech-marketplace.firebasestorage.app",
  messagingSenderId: "876996477416",
  appId: "1:876996477416:web:97d345f58a50879db8a45d",
  measurementId: "G-16X8NH8BDM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);

// Exportar serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
