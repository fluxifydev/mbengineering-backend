"use server";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(formData, folder) {
  const file = formData.get('file');
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder,
        resource_type: "auto" 
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error.message);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(url) {
  if (!url) return;
  
  try {
    const parts = url.split('/');
    // e.g. https://res.cloudinary.com/die125cwk/image/upload/v1234/folder/file.jpg
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;

    // The public ID includes the folder path but NOT the version (v1234) and NOT the extension
    // parts = [..., "upload", "v1234", "folder", "file.jpg"]
    // so we skip the version string by taking uploadIndex + 2
    const folderAndFile = parts.slice(uploadIndex + 2).join('/');
    
    // Remove the file extension
    const publicId = folderAndFile.split('.').slice(0, -1).join('.');
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
}
