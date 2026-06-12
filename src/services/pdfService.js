import { db } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  query 
} from "firebase/firestore";
import { uploadToCloudinary, deleteFromCloudinary } from "@/actions/cloudinary";

const COLLECTION_NAME = "pdfs";

const promiseWithTimeout = (promise, ms, message) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
};

const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const uploadPdf = async (file) => {
  return await promiseWithTimeout(
    (async () => {
      if (!file) throw new Error("No file provided");
      
      if (file.type !== 'application/pdf') {
        throw new Error("Only PDF files are allowed");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File exceeds 10MB limit");
      }

      const dataUri = await fileToDataUri(file);

      const formData = new FormData();
      formData.append("dataUri", dataUri);
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("isRaw", "true");
      
      const result = await uploadToCloudinary(formData, "pdfs");
      
      if (result?.error) {
        throw new Error(result.error);
      }

      const docPromise = addDoc(collection(db, COLLECTION_NAME), {
        name: file.name,
        url: result.url,
        size: file.size,
        createdAt: serverTimestamp(),
      });

      const docRef = await promiseWithTimeout(
        docPromise, 
        8000, 
        "Firebase Database not reachable."
      );

      return { id: docRef.id, url: result.url };
    })(),
    60000,
    "File upload timed out (took longer than 60 seconds). Please check your internet connection."
  );
};

export const getPdfs = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const pdfs = [];
    querySnapshot.forEach((doc) => {
      pdfs.push({ id: doc.id, ...doc.data() });
    });
    return pdfs;
  } catch (error) {
    console.error("Error getting PDFs:", error);
    throw error;
  }
};

export const deletePdf = async (id, url) => {
  try {
    const pdfRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(pdfRef);

    if (url && url.includes("cloudinary.com")) {
      await promiseWithTimeout(
        deleteFromCloudinary(url),
        30000,
        "File deletion from Cloudinary timed out."
      );
    }
  } catch (error) {
    console.error("Error deleting PDF:", error);
    throw error;
  }
};
