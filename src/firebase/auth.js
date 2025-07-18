import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';
import { userService } from './firestore';
import { userCodeService } from '../services/userCodeService';

// Provedores de autenticação
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Configurar provedores
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const authService = {
  // Registrar novo usuário
  async register(email, password, name, userType = 'cliente') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Atualizar perfil com nome
      await updateProfile(user, { displayName: name });
      
      // Gerar código único do usuário
      const codeResult = await userCodeService.generateUniqueUserCode();
      const userCode = codeResult.success ? codeResult.code : null;
      
      // Tentar salvar dados do usuário no Firestore (opcional)
      try {
        await userService.createUser(user.uid, {
          name,
          email,
          userType,
          userCode,
          codeGeneratedAt: new Date(),
          createdAt: new Date(),
          profilePicture: user.photoURL || null
        });
        
        console.log(`✅ Usuário registrado com código: ${userCode}`);
      } catch (firestoreError) {
        console.warn('Erro ao salvar no Firestore, mas usuário criado:', firestoreError);
      }
      
      return { success: true, user, userCode };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login com email e senha
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login com Google
  async loginWithGoogle(userType = 'cliente') {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Tentar verificar/salvar no Firestore (opcional)
      try {
        const userData = await userService.getUser(user.uid);
        if (!userData.success) {
          // Usuário novo - gerar código único
          const codeResult = await userCodeService.generateUniqueUserCode();
          const userCode = codeResult.success ? codeResult.code : null;
          
          await userService.createUser(user.uid, {
            name: user.displayName,
            email: user.email,
            userType,
            userCode,
            codeGeneratedAt: new Date(),
            createdAt: new Date(),
            profilePicture: user.photoURL
          });
          
          console.log(`✅ Usuário Google registrado com código: ${userCode}`);
        } else if (!userData.data.userCode) {
          // Usuário existente sem código - gerar código
          const assignResult = await userCodeService.assignCodeToUser(user.uid, userData.data.userType);
          if (assignResult.success) {
            console.log(`✅ Código ${assignResult.code} atribuído ao usuário existente`);
          }
        }
      } catch (firestoreError) {
        console.warn('Erro no Firestore, mas login funcionou:', firestoreError);
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login com Facebook
  async loginWithFacebook(userType = 'cliente') {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      // Verificar se é novo usuário e salvar no Firestore
      const userData = await userService.getUser(user.uid);
      if (!userData) {
        await userService.createUser(user.uid, {
          name: user.displayName,
          email: user.email,
          userType,
          createdAt: new Date(),
          profilePicture: user.photoURL
        });
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Recuperar senha
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Observar mudanças no estado de autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Obter usuário atual
  getCurrentUser() {
    return auth.currentUser;
  }
};
