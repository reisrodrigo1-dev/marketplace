import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from './config';


const courseService = {
  async getPublishedCoursesByUser(userId) {
    try {
      const q = query(
        collection(db, 'courses'),
        where('status', '==', 'publicado'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: courses };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  async getCoursesByIds(ids) {
    try {
      if (!ids || !ids.length) return { success: true, data: [] };
      const courses = [];
      for (const id of ids) {
        const docRef = doc(db, 'courses', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Loga o documento bruto do Firestore para debug
          // eslint-disable-next-line no-console
          console.log('Documento bruto do Firestore:', docSnap.data());
          courses.push({ id: docSnap.id, ...docSnap.data() });
        }
      }
      return { success: true, data: courses };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export { courseService };
