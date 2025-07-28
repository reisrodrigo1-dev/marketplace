import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Salva e recupera anotações do aluno por curso/aula
export const notesService = {
  // Salva anotação
  async saveNote({ alunoId, cursoId, aulaId, nota }) {
    if (!alunoId || !cursoId || !aulaId) return { success: false, error: 'Dados obrigatórios faltando' };
    const ref = doc(db, 'anotacoesAluno', `${alunoId}_${cursoId}_${aulaId}`);
    await setDoc(ref, { alunoId, cursoId, aulaId, nota, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  },
  // Recupera anotação
  async getNote({ alunoId, cursoId, aulaId }) {
    if (!alunoId || !cursoId || !aulaId) return { success: false, error: 'Dados obrigatórios faltando' };
    const ref = doc(db, 'anotacoesAluno', `${alunoId}_${cursoId}_${aulaId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, nota: '' };
    return { success: true, nota: snap.data().nota || '' };
  }
};
