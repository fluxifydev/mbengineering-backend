"use client";

import { useState, useEffect } from "react";
import { addProduct } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [imageFiles, setImageFiles] = useState([]);
  
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  const selectedCategoryObj = categories.find(c => c.name === category);
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    for (let file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`Image "${file.name}" is larger than 4MB. Please select smaller images.`);
        return;
      }
    }

    if (imageFiles.length + files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
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
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanedSpecs = specifications.filter(s => s.key.trim() !== "" || s.value.trim() !== "");
      await addProduct(
        { name, description, category, subcategory, specifications: cleanedSpecs },
        imageFiles,
        brochureFile
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to add product");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link 
          href="/dashboard" 
          className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">Create a new machine product listing</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Machine Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
              placeholder="e.g. CNC Milling Machine XYZ-2000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 resize-none"
              placeholder="Enter a detailed description of the machine..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category (Optional)</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 appearance-none"
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subcategory (Optional)</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!category || availableSubcategories.length === 0}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a Subcategory</option>
                {availableSubcategories.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
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
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm"
                      placeholder="e.g. Max Web Width"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm"
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
            <p className="text-xs text-gray-500 mt-2">Add up to 18 specifications. Empty rows will be ignored.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                <span className="text-xs text-gray-500">{imageFiles.length} / 5</span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload files</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={imageFiles.length >= 5}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                {imageFiles.length > 0 && (
                  <div className="mt-4 space-y-2 text-left">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center bg-blue-50 py-2 px-3 rounded text-sm font-medium text-blue-700">
                        <span className="truncate mr-2">{file.name}</span>
                        <button type="button" onClick={() => handleRemoveImage(index)} className="text-blue-400 hover:text-blue-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Brochure (PDF)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 4 * 1024 * 1024) {
                          alert("Brochure is larger than 4MB. Please select a smaller PDF.");
                          return;
                        }
                        setBrochureFile(file);
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                {brochureFile && (
                  <p className="mt-3 text-sm font-medium text-blue-600 truncate bg-blue-50 py-1 px-2 rounded">{brochureFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
