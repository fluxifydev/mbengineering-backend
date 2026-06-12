import { db } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  query 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";
import { uploadToCloudinary, deleteFromCloudinary } from "@/actions/cloudinary";

const COLLECTION_NAME = "products";

// Helper to upload a file and get Cloudinary URL
const uploadFile = async (file, folderPath, isRaw = false) => {
  if (!file) return null;

  if (isRaw) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
    
    const storageRef = ref(storage, `${folderPath}/${uniqueSuffix}-${finalName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("isRaw", "false");
  
  const result = await uploadToCloudinary(formData, folderPath);
  if (result?.error) {
    throw new Error(result.error);
  }
  return result?.url || null;
};

const deleteFile = async (url) => {
  if (!url) return;
  if (url.includes("firebasestorage.googleapis.com")) {
    try {
      // Create a reference from the download URL and delete it
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (err) {
      console.error("Firebase Storage delete error:", err);
    }
  } else if (url.includes("cloudinary.com")) {
    await deleteFromCloudinary(url);
  }
};

const promiseWithTimeout = (promise, ms, message) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
};

export const addProduct = async (productData, imageFiles, brochureFile) => {
  try {
    let imageUrls = [];
    let brochureUrl = null;

    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const url = await uploadFile(file, "product_images");
        imageUrls.push(url);
      }
    }
    if (brochureFile) {
      brochureUrl = await uploadFile(brochureFile, "product_brochures", true);
    }

    const docPromise = addDoc(collection(db, COLLECTION_NAME), {
      ...productData,
      imageUrls,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
      brochureUrl,
      createdAt: serverTimestamp(),
    });

    const docRef = await promiseWithTimeout(
      docPromise, 
      8000, 
      "Firebase Database not found or unreachable. Please ensure you have created the Firestore Database in your Firebase Console."
    );

    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData, newImageFiles, newBrochureFile, remainingImageUrls, oldBrochureUrl, deletedImageUrls) => {
  try {
    const updateData = { ...productData };

    let imageUrls = [...(remainingImageUrls || [])];

    if (deletedImageUrls && deletedImageUrls.length > 0) {
      for (const url of deletedImageUrls) {
        await deleteFile(url);
      }
    }

    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        const url = await uploadFile(file, "product_images");
        imageUrls.push(url);
      }
    }
    
    updateData.imageUrls = imageUrls;
    updateData.imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

    if (newBrochureFile) {
      updateData.brochureUrl = await uploadFile(newBrochureFile, "product_brochures", true);
      if (oldBrochureUrl) await deleteFile(oldBrochureUrl);
    }

    const productRef = doc(db, COLLECTION_NAME, id);
    const updatePromise = updateDoc(productRef, updateData);
    
    await promiseWithTimeout(
      updatePromise,
      8000,
      "Firebase Database not found or unreachable. Please ensure you have created the Firestore Database in your Firebase Console."
    );
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id, imageUrls, brochureUrl) => {
  try {
    const productRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(productRef);

    // Delete files
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        await deleteFile(url);
      }
    }
    if (brochureUrl) await deleteFile(brochureUrl);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
