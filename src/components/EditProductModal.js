"use client";

import { useState } from "react";
import { X, UploadCloud, Plus, Trash2 } from "lucide-react";
import { updateProduct } from "@/services/productService";

export default function EditProductModal({ product, onClose, onSave }) {
  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [specifications, setSpecifications] = useState(
    Array.isArray(product.specifications) 
      ? (product.specifications.length > 0 ? product.specifications : [{ key: "", value: "" }]) 
      : [{ key: "", value: "" }]
  );
  
  const [imageFiles, setImageFiles] = useState([]);
  const [remainingImageUrls, setRemainingImageUrls] = useState(
    product.imageUrls ? [...product.imageUrls] : (product.imageUrl ? [product.imageUrl] : [])
  );
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    for (let file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`Image "${file.name}" is larger than 4MB. Please select smaller images.`);
        return;
      }
    }

    if (remainingImageUrls.length + imageFiles.length + files.length > 5) {
      alert("You can only have a maximum of 5 images.");
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  const handleRemoveExistingImage = (index) => {
    const urlToRemove = remainingImageUrls[index];
    setDeletedImageUrls([...deletedImageUrls, urlToRemove]);
    
    const newRemaining = [...remainingImageUrls];
    newRemaining.splice(index, 1);
    setRemainingImageUrls(newRemaining);
  };

  const handleAddSpec = () => {
    if (specifications.length < 18) {
      setSpecifications([...specifications, { key: "", value: "" }]);
    }
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const handleSpecChange = (index, field, val) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = val;
    setSpecifications(newSpecs);
  };
  const [brochureFile, setBrochureFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanedSpecs = specifications.filter(s => s.key.trim() !== "" || s.value.trim() !== "");
      await updateProduct(
        product.id,
        { name, description, specifications: cleanedSpecs },
        imageFiles,
        brochureFile,
        remainingImageUrls,
        product.brochureUrl,
        deletedImageUrls
      );
      onSave(); // Refresh list and close
    } catch (err) {
      setError(err.message || "Failed to update product");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Machine Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Specifications</label>
              <span className="text-xs text-gray-500">{specifications.length} / 18</span>
            </div>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex space-x-3 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 text-sm"
                      placeholder="e.g. Max Web Width"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 text-sm"
                      placeholder="e.g. 1300 mm"
                    />
                  </div>
                  {specifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                      title="Remove specification"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {specifications.length < 18 && (
              <button
                type="button"
                onClick={handleAddSpec}
                className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} className="mr-1" />
                Add Specification
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Update Images</label>
                <span className="text-xs text-gray-500">{remainingImageUrls.length + imageFiles.length} / 5</span>
              </div>
              
              {remainingImageUrls.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Current Images</p>
                  {remainingImageUrls.map((url, index) => (
                    <div key={index} className="flex justify-between items-center bg-white border border-gray-200 py-1.5 px-3 rounded text-sm font-medium text-gray-700">
                      <span className="truncate mr-2 text-xs">{url.substring(0, 30)}...</span>
                      <button type="button" onClick={() => handleRemoveExistingImage(index)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">New Images</p>
                  {imageFiles.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-blue-50 border border-blue-100 py-1.5 px-3 rounded text-sm font-medium text-blue-700">
                      <span className="truncate mr-2 text-xs">{file.name}</span>
                      <button type="button" onClick={() => handleRemoveNewImage(index)} className="text-blue-400 hover:text-blue-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={remainingImageUrls.length + imageFiles.length >= 5}
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Update Brochure (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 4 * 1024 * 1024) {
                    alert("Brochure is larger than 4MB. Please select a smaller PDF.");
                    return;
                  }
                  setBrochureFile(file);
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-colors"
              />
              {product.brochureUrl && !brochureFile && (
                <p className="text-xs text-gray-500 mt-2 truncate">Current: {product.brochureUrl.substring(0, 30)}...</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
