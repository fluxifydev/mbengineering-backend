import { db } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  query,
} from "firebase/firestore";
import { uploadToCloudinary, deleteFromCloudinary } from "@/actions/cloudinary";

const COLLECTION_NAME = "blogs";

const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const uploadCoverImage = async (file) => {
  if (!file) return null;
  
  const dataUri = await fileToDataUri(file);
  
  const formData = new FormData();
  formData.append("dataUri", dataUri);
  formData.append("fileName", file.name);
  formData.append("fileType", file.type);
  
  const uploadResult = await uploadToCloudinary(formData, "blogs");
  if (uploadResult?.error) {
    throw new Error(uploadResult.error);
  }
  return uploadResult?.url || null;
};

// Add a new blog
export const addBlog = async (blogData, coverImageFile) => {
  try {
    let coverImageUrl = null;
    if (coverImageFile) {
      coverImageUrl = await uploadCoverImage(coverImageFile);
    }

    const docPromise = addDoc(collection(db, COLLECTION_NAME), {
      ...blogData,
      coverImageUrl,
      createdAt: serverTimestamp(),
    });

    const docRef = await docPromise;
    return docRef.id;
  } catch (error) {
    console.error("Error adding blog: ", error);
    throw error;
  }
};

// Get all blogs
export const getBlogs = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const blogs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      };
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs: ", error);
    throw error;
  }
};

// Get a single blog by ID
export const getBlogById = async (blogId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, blogId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      };
    } else {
      throw new Error("Blog not found");
    }
  } catch (error) {
    console.error("Error fetching blog: ", error);
    throw error;
  }
};

// Update an existing blog
export const updateBlog = async (blogId, blogData, newCoverImageFile, existingCoverImageUrl, deletedCoverImageUrl) => {
  try {
    let coverImageUrl = existingCoverImageUrl;

    // Delete the old image if requested
    if (deletedCoverImageUrl) {
      await deleteFromCloudinary(deletedCoverImageUrl);
      coverImageUrl = null;
    }

    // Upload the new image if provided
    if (newCoverImageFile) {
      coverImageUrl = await uploadCoverImage(newCoverImageFile);
    }

    const blogRef = doc(db, COLLECTION_NAME, blogId);
    await updateDoc(blogRef, {
      ...blogData,
      coverImageUrl,
    });
  } catch (error) {
    console.error("Error updating blog: ", error);
    throw error;
  }
};

// Delete a blog
export const deleteBlog = async (blogId, coverImageUrl) => {
  try {
    // Delete image from Cloudinary
    if (coverImageUrl) {
      await deleteFromCloudinary(coverImageUrl);
    }

    // Delete document from Firestore
    await deleteDoc(doc(db, COLLECTION_NAME, blogId));
  } catch (error) {
    console.error("Error deleting blog: ", error);
    throw error;
  }
};
