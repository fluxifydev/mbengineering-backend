import { useState } from "react";
import { X, UploadCloud, Images } from "lucide-react";
import { addBanner } from "@/services/bannerService";

export default function AddBannerModal({ onClose, onSave }) {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" is larger than 5MB. Please select a smaller image.`);
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!imageFile) {
      setError("Please select a background image for the slide.");
      setLoading(false);
      return;
    }

    try {
      await addBanner(
        { heading, description },
        imageFile
      );
      onSave(); // Refresh list and close
    } catch (err) {
      setError(err.message || "Failed to add slide");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Images size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Slide</h2>
              <p className="text-sm text-gray-500 mt-0.5">Create a new hero banner slide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Machine Name / Heading *</label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
              placeholder="e.g. End-to-End Engineering Partnership."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Short Description *</label>
              <span className={`text-xs ${description.length > 200 ? 'text-orange-500 font-bold' : 'text-gray-500'}`}>
                {description.length} / 200 chars (approx 40 words)
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 resize-none"
              placeholder="From personalized engineering consultation to seamless onsite integration..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Background Image (16:9 Ratio) *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
              <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a high quality image</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: 1920x1080px (16:9). JPG, PNG up to 5MB.</p>
              {imageFile && (
                <p className="mt-3 text-sm font-medium text-blue-600 truncate bg-blue-50 py-1.5 px-3 rounded inline-block max-w-full">
                  {imageFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : "Add Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
