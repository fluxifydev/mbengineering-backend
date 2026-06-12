import { db } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
} from "firebase/firestore";

const COLLECTION_NAME = "categories";

export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    categories.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    
    return categories;
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

export const addCategory = async (name, subcategories = []) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name,
      subcategories,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (id, name, subcategories) => {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, {
      name,
      subcategories,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
