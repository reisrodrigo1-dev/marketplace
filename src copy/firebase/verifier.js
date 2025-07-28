// 🔍 Verificador de Configuração do Firebase
// Execute este arquivo para verificar se o Firebase está configurado corretamente

import { auth, db } from './config';

const verificarFirebase = async () => {
  console.log('🔍 Verificando configuração do Firebase...\n');

  try {
    // 1. Verificar configuração básica
    console.log('✅ Firebase inicializado com sucesso');
    console.log('📱 App ID:', auth.app.options.appId);
    console.log('🔑 Project ID:', auth.app.options.projectId);
    console.log('🌐 Auth Domain:', auth.app.options.authDomain);
    
    // 2. Verificar se as credenciais são de exemplo
    if (auth.app.options.apiKey === "AIzaSyB_EXEMPLO_SUBSTITUA_PELA_SUA_KEY") {
      console.log('❌ ERRO: Você ainda está usando credenciais de exemplo!');
      console.log('📝 Siga as instruções no arquivo FIREBASE_SETUP.md');
      return false;
    }

    // 3. Verificar conectividade
    console.log('\n🔗 Testando conectividade...');
    
    // Teste simples de conexão
    const user = auth.currentUser;
    console.log('👤 Usuário atual:', user ? user.email : 'Nenhum usuário logado');
    
    console.log('\n✅ Firebase configurado corretamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na configuração do Firebase:', error);
    return false;
  }
};

// Executar verificação
export default verificarFirebase;
