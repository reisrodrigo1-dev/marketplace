// Script para garantir que todas as aulas dos cursos tenham o campo aoVivo (false se não existir)
// Execute este script em ambiente seguro, com permissão de escrita no Firestore

import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

async function patchLessonsAoVivo() {
  const coursesSnap = await getDocs(collection(db, 'courses'));
  for (const courseDoc of coursesSnap.docs) {
    const course = courseDoc.data();
    let changed = false;
    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach(section => {
        if (section.lessons && Array.isArray(section.lessons)) {
          section.lessons.forEach(lesson => {
            if (lesson.aoVivo === undefined) {
              lesson.aoVivo = false;
              changed = true;
              console.log(`Aula ${lesson.id} do curso ${courseDoc.id} atualizada com aoVivo: false`);
            }
          });
        }
      });
      if (changed) {
        try {
          await updateDoc(doc(db, 'courses', courseDoc.id), { sections: course.sections });
          console.log(`Curso ${courseDoc.id} atualizado.`);
        } catch (err) {
          console.error(`Erro ao atualizar curso ${courseDoc.id}:`, err);
        }
      }
    }
  }
  console.log('Patch concluído!');
}

patchLessonsAoVivo();
