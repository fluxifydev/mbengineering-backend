"use server";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";

export async function uploadToFirebaseServerAction(dataUri, folder, fileName) {
  try {
    const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
    const buffer = Buffer.from(base64Data, 'base64');
    
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
    
    const storageRef = ref(storage, `${folder}/${uniqueSuffix}-${finalName}`);
    
    const uint8Array = new Uint8Array(buffer);
    
    await uploadBytes(storageRef, uint8Array, { contentType: 'application/pdf' });
    const url = await getDownloadURL(storageRef);
    
    return { url };
  } catch (error) {
    console.error("Firebase upload error on server:", error);
    return { error: error.message || "Failed to upload to Firebase" };
  }
}

export async function deleteFromFirebaseServerAction(url) {
  try {
    if (!url) return { success: true };
    if (url.includes("firebasestorage.googleapis.com")) {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    }
    return { success: true };
  } catch (error) {
    console.error("Firebase delete error on server:", error);
    return { error: error.message || "Failed to delete from Firebase" };
  }
}
