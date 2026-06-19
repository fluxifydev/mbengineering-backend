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
  query,
} from "firebase/firestore";
import { uploadToCloudinary, deleteFromCloudinary } from "@/actions/cloudinary";

const COLLECTION_NAME = "banners";

const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const promiseWithTimeout = (promise, ms, message) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
};

const uploadFile = async (file, folderPath) => {
  return await promiseWithTimeout(
    (async () => {
      if (!file) return null;

      const dataUri = await fileToDataUri(file);

      const formData = new FormData();
      formData.append("dataUri", dataUri);
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("isRaw", "false");
      
      const result = await uploadToCloudinary(formData, folderPath);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result?.url || null;
    })(),
    60000,
    "Image upload timed out. Please check your internet connection or try a smaller image."
  );
};

const deleteFile = async (url) => {
  if (!url) return;
  return await promiseWithTimeout(
    (async () => {
      await deleteFromCloudinary(url);
    })(),
    30000,
    "Image deletion timed out."
  );
};

export const addBanner = async (bannerData, imageFile) => {
  try {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadFile(imageFile, "hero_banners");
    }

    const docPromise = addDoc(collection(db, COLLECTION_NAME), {
      ...bannerData,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    const docRef = await promiseWithTimeout(
      docPromise, 
      8000, 
      "Firebase Database not found or unreachable. Please check your connection."
    );

    return docRef.id;
  } catch (error) {
    console.error("Error adding banner:", error);
    throw error;
  }
};

export const getBanners = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const banners = [];
    querySnapshot.forEach((doc) => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort client-side by createdAt descending
    banners.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    
    return banners;
  } catch (error) {
    console.error("Error getting banners:", error);
    throw error;
  }
};

export const updateBanner = async (id, bannerData, newImageFile, oldImageUrl, deleteOldImage = false) => {
  try {
    const updateData = { ...bannerData };

    let currentImageUrl = oldImageUrl;

    // Delete old image if we're replacing it or removing it
    if (deleteOldImage && oldImageUrl) {
      await deleteFile(oldImageUrl);
      currentImageUrl = null;
    }

    // Upload new image
    if (newImageFile) {
      currentImageUrl = await uploadFile(newImageFile, "hero_banners");
    }

    updateData.imageUrl = currentImageUrl;

    const bannerRef = doc(db, COLLECTION_NAME, id);
    const updatePromise = updateDoc(bannerRef, updateData);
    
    await promiseWithTimeout(
      updatePromise,
      8000,
      "Firebase Database not found or unreachable."
    );
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

export const deleteBanner = async (id, imageUrl) => {
  try {
    const bannerRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(bannerRef);

    // Delete associated image
    if (imageUrl) {
      await deleteFile(imageUrl);
    }
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};
