import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function debugPageFiltering() {
  try {
    console.log('🔍 DEPURAÇÃO: Analisando estrutura de dados para filtragem por página...\n');

    // Buscar alguns agendamentos
    const appointmentsQuery = query(collection(db, 'appointments'));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).slice(0, 3); // Primeiros 3 para análise

    // Buscar alguns pagamentos
    const financialQuery = query(collection(db, 'financial'));
    const financialSnapshot = await getDocs(financialQuery);
    
    const payments = financialSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).slice(0, 3); // Primeiros 3 para análise

    console.log('📋 AGENDAMENTOS - Campos relacionados a página:');
    appointments.forEach((apt, index) => {
      console.log(`  Agendamento ${index + 1}:`, {
        id: apt.id.substring(0, 8),
        selectedPageId: apt.selectedPageId || 'VAZIO',
        pageId: apt.pageId || 'VAZIO',
        lawyerUserId: apt.lawyerUserId || 'VAZIO'
      });
    });

    console.log('\n💰 PAGAMENTOS - Campos relacionados a página:');
    payments.forEach((payment, index) => {
      console.log(`  Pagamento ${index + 1}:`, {
        id: payment.id.substring(0, 8),
        selectedPageId: payment.selectedPageId || 'VAZIO',
        pageId: payment.pageId || 'VAZIO',
        lawyerId: payment.lawyerId || 'VAZIO'
      });
    });

    // Análise de compatibilidade
    const aptWithSelectedPageId = appointments.filter(apt => apt.selectedPageId).length;
    const aptWithPageId = appointments.filter(apt => apt.pageId).length;
    const paymentsWithSelectedPageId = payments.filter(p => p.selectedPageId).length;
    const paymentsWithPageId = payments.filter(p => p.pageId).length;

    console.log('\n📊 ANÁLISE DE COMPATIBILIDADE:');
    console.log(`  Agendamentos com selectedPageId: ${aptWithSelectedPageId}/${appointments.length}`);
    console.log(`  Agendamentos com pageId: ${aptWithPageId}/${appointments.length}`);
    console.log(`  Pagamentos com selectedPageId: ${paymentsWithSelectedPageId}/${payments.length}`);
    console.log(`  Pagamentos com pageId: ${paymentsWithPageId}/${payments.length}`);

    if (aptWithSelectedPageId > 0 && paymentsWithPageId === 0 && paymentsWithSelectedPageId === 0) {
      console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
      console.log('   - Agendamentos usam "selectedPageId"');
      console.log('   - Pagamentos não têm nem "selectedPageId" nem "pageId"');
      console.log('   - Precisa padronizar os campos ou migrar dados');
    }

    if (appointments.length > 0 && payments.length > 0) {
      console.log('\n🔗 TENTATIVA DE CORRELAÇÃO:');
      
      // Verificar se algum pagamento tem appointmentId
      const paymentsWithAppointmentId = payments.filter(p => p.appointmentId);
      console.log(`   Pagamentos com appointmentId: ${paymentsWithAppointmentId.length}/${payments.length}`);
      
      if (paymentsWithAppointmentId.length > 0) {
        console.log('   📝 Estratégia sugerida: Usar appointmentId para correlação');
        console.log('   1. Payment.appointmentId → Appointment.id → Appointment.selectedPageId');
      }
    }

  } catch (error) {
    console.error('Erro na depuração:', error);
  }
}

// Executar depuração
debugPageFiltering();
