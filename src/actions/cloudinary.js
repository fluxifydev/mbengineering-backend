"use server";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadToCloudinary(formData, folder) {
  try {
    const file = formData.get('file');
    if (!file) return { error: "No file provided" };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isRaw = formData.get("isRaw") === "true";
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const resourceType = (isRaw || isPdf) ? 'raw' : 'auto';

    const uploadOptions = { 
      folder: folder,
      resource_type: resourceType 
    };

    if (resourceType === 'raw') {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const finalName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;
      uploadOptions.public_id = `${uniqueSuffix}-${finalName}`;
    }

    const url = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(buffer);
    });

    return { url };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return { error: error.message || "Cloudinary upload failed" };
  }
}

export async function deleteFromCloudinary(url) {
  if (!url) return;
  
  try {
    const isRaw = url.includes('/raw/upload/');
    const parts = url.split('/');
    // e.g. https://res.cloudinary.com/die125cwk/image/upload/v1234/folder/file.jpg
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;

    // The public ID includes the folder path but NOT the version (v1234) and NOT the extension
    // parts = [..., "upload", "v1234", "folder", "file.jpg"]
    // so we skip the version string by taking uploadIndex + 2
    const folderAndFile = parts.slice(uploadIndex + 2).join('/');
    
    // For images, Cloudinary destroy expects public_id without extension
    // For raw files, Cloudinary destroy expects public_id WITH extension
    const publicId = isRaw ? folderAndFile : folderAndFile.split('.').slice(0, -1).join('.');
    
    await cloudinary.uploader.destroy(publicId, { resource_type: isRaw ? 'raw' : 'image' });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
}
