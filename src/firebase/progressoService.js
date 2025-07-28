import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Serviço para salvar e recuperar progresso do aluno por curso
export const progressoService = {
  // Salva lista de aulas concluídas
  async saveProgresso({ alunoId, cursoId, aulasConcluidas }) {
    if (!alunoId || !cursoId) return { success: false, error: 'Dados obrigatórios faltando' };
    const ref = doc(db, 'progressoAluno', `${alunoId}_${cursoId}`);
    await setDoc(ref, { alunoId, cursoId, aulasConcluidas, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  },
  // Recupera lista de aulas concluídas
  async getProgresso({ alunoId, cursoId }) {
    if (!alunoId || !cursoId) return { success: false, error: 'Dados obrigatórios faltando' };
    const ref = doc(db, 'progressoAluno', `${alunoId}_${cursoId}`);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: true, aulasConcluidas: [] };
    return { success: true, aulasConcluidas: snap.data().aulasConcluidas || [] };
  }
};
