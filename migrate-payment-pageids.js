import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhFHBJ-3gNJY-UcUlJq0XTmFTzPFg2hQQ",
  authDomain: "direitohuboficial.firebaseapp.com",
  projectId: "direitohuboficial",
  storageBucket: "direitohuboficial.appspot.com",
  messagingSenderId: "950932020334",
  appId: "1:950932020334:web:77ac7bac6502c6a0f1e8b6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migratePaymentPageIds() {
  try {
    console.log('🔄 Iniciando migração de pageId para pagamentos...\n');

    // Buscar todos os pagamentos sem pageId
    const financialQuery = query(collection(db, 'financial'));
    const financialSnapshot = await getDocs(financialQuery);
    
    let paymentsWithoutPageId = [];
    let paymentsProcessed = 0;
    let paymentsUpdated = 0;

    console.log('📊 Analisando pagamentos...');
    
    for (const docSnap of financialSnapshot.docs) {
      const payment = { id: docSnap.id, ...docSnap.data() };
      paymentsProcessed++;
      
      // Verificar se pagamento tem pageId
      if (!payment.pageId && payment.appointmentId) {
        console.log(`📄 Pagamento ${payment.id} sem pageId, mas tem appointmentId: ${payment.appointmentId}`);
        
        try {
          // Buscar agendamento correspondente
          const appointmentDoc = await getDoc(doc(db, 'appointments', payment.appointmentId));
          
          if (appointmentDoc.exists()) {
            const appointmentData = appointmentDoc.data();
            
            if (appointmentData.selectedPageId) {
              console.log(`  ✅ Agendamento encontrado com selectedPageId: ${appointmentData.selectedPageId}`);
              
              // Atualizar pagamento com pageId
              await updateDoc(doc(db, 'financial', payment.id), {
                pageId: appointmentData.selectedPageId
              });
              
              paymentsUpdated++;
              console.log(`  💾 Pagamento ${payment.id} atualizado com pageId: ${appointmentData.selectedPageId}\n`);
            } else {
              console.log(`  ⚠️ Agendamento existe mas não tem selectedPageId\n`);
            }
          } else {
            console.log(`  ❌ Agendamento ${payment.appointmentId} não encontrado\n`);
          }
        } catch (error) {
          console.error(`  💥 Erro ao processar pagamento ${payment.id}:`, error.message);
        }
      } else if (payment.pageId) {
        console.log(`✅ Pagamento ${payment.id} já tem pageId: ${payment.pageId}`);
      } else if (!payment.appointmentId) {
        console.log(`⚠️ Pagamento ${payment.id} sem appointmentId para correlação`);
      }
    }

    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log(`📄 Pagamentos processados: ${paymentsProcessed}`);
    console.log(`✅ Pagamentos atualizados: ${paymentsUpdated}`);
    console.log(`🎉 Migração concluída!`);

    return {
      processed: paymentsProcessed,
      updated: paymentsUpdated,
      success: true
    };

  } catch (error) {
    console.error('💥 Erro na migração:', error);
    return {
      processed: 0,
      updated: 0,
      success: false,
      error: error.message
    };
  }
}

// Executar migração
migratePaymentPageIds()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 Migração bem-sucedida!');
      console.log('Agora teste o filtro por página no dashboard financeiro.');
    } else {
      console.log('\n❌ Migração falhou:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Erro crítico:', error);
  });
