// 🧪 Teste de Configuração do Firebase
// Adicione este código temporariamente ao seu App.jsx para testar

import { useEffect } from 'react';
import { auth, db } from './firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const TesteFirebase = () => {
  useEffect(() => {
    const testarFirebase = async () => {
      console.log('🧪 Iniciando teste do Firebase...');
      
      try {
        // Teste 1: Verificar configuração
        console.log('✅ Firebase Config:', {
          projectId: auth.app.options.projectId,
          authDomain: auth.app.options.authDomain,
          apiKey: auth.app.options.apiKey ? 'Configurado' : 'Não configurado'
        });

        // Teste 2: Testar Firestore
        const testDoc = doc(db, 'teste', 'conexao');
        await setDoc(testDoc, {
          timestamp: new Date(),
          status: 'funcionando'
        });
        
        const docSnap = await getDoc(testDoc);
        if (docSnap.exists()) {
          console.log('✅ Firestore funcionando!', docSnap.data());
        }

        // Teste 3: Testar Auth
        console.log('✅ Auth funcionando!', auth.currentUser);

        console.log('🎉 Todos os testes passaram!');
        
      } catch (error) {
        console.error('❌ Erro no teste:', error);
      }
    };

    testarFirebase();
  }, []);

  return null;
};

export default TesteFirebase;
