import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateAssociations() {
  const assocSnap = await getDocs(collection(db, 'cliente_processo'));
  for (const assocDoc of assocSnap.docs) {
    const assoc = assocDoc.data();
    if (!assoc.clienteId) continue;
    const clientDoc = await getDoc(doc(db, 'clientes', assoc.clienteId));
    if (!clientDoc.exists()) continue;
    const clientData = clientDoc.data();
    const clienteNome = clientData.nome || clientData.name || '';
    const paginaId = clientData.paginaId || '';
    const nomePagina = clientData.nomePagina || '';
    await setDoc(doc(db, 'cliente_processo', assocDoc.id), {
      ...assoc,
      clienteNome,
      paginaId,
      nomePagina
    }, { merge: true });
    console.log(`[UPDATE] Associação ${assocDoc.id} atualizada com nome: ${clienteNome}, paginaId: ${paginaId}, nomePagina: ${nomePagina}`);
  }
  console.log('Atualização concluída!');
}

updateAssociations().catch(console.error);
