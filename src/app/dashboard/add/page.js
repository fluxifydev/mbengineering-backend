"use client";

import { useState } from "react";
import { addProduct } from "@/services/productService";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addProduct(
        { name, description, specifications },
        imageFile,
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specifications</label>
            <textarea
              rows={5}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 resize-none font-mono text-sm"
              placeholder="- Motor: 5HP&#10;- Capacity: 1000kg/hr&#10;- Voltage: 380V"
            />
            <p className="text-xs text-gray-500 mt-2">You can use bullet points or free text.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input 
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                {imageFile && (
                  <p className="mt-3 text-sm font-medium text-blue-600 truncate bg-blue-50 py-1 px-2 rounded">{imageFile.name}</p>
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
                      onChange={(e) => setBrochureFile(e.target.files[0])}
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
