import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const productService = {
  async createProduct(userId, productData) {
    try {
      const productRef = doc(collection(db, 'products'));
      await setDoc(productRef, {
        ...productData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: productRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserProducts(userId) {
    try {
      const q = query(collection(db, 'products'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateProduct(productId, productData) {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...productData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export { productService };
