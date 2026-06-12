"use client";

import { useState, useEffect } from "react";
import { getPdfs, deletePdf, uploadPdf } from "@/services/pdfService";
import { FileText, Download, ExternalLink, Trash2, UploadCloud, File as FileIcon } from "lucide-react";

export default function PdfsManagement() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPdf, setDeletingPdf] = useState(null);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const data = await getPdfs();
      setPdfs(data);
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    try {
      await uploadPdf(file);
      // Reset input
      e.target.value = "";
      fetchPdfs(); // Refresh list automatically
    } catch (error) {
      console.error("Upload failed", error);
      alert(error.message || "Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPdf) return;
    try {
      await deletePdf(deletingPdf.id, deletingPdf.url);
      setDeletingPdf(null);
      fetchPdfs();
    } catch (error) {
      console.error("Failed to delete PDF", error);
      alert("Failed to delete PDF.");
    }
  };

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    // Add fl_attachment for forced download in Cloudinary
    return url.replace("/upload/", "/upload/fl_attachment/");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return (bytes / 1024).toFixed(1) + " KB";
    return mb.toFixed(2) + " MB";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF Management</h1>
          <p className="text-gray-500 mt-1">Upload and manage standalone PDF documents</p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="pdf-upload"
            className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer ${
              uploading 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={20} className="mr-2" />
                Upload PDF
              </>
            )}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : pdfs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No PDFs found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Upload your first PDF document using the button above.</p>
          <label
            htmlFor="pdf-upload"
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-medium inline-flex transition-colors cursor-pointer"
          >
            Upload PDF
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md">
              <div className="p-6 flex-grow">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                  <FileIcon className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 break-words">{pdf.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{formatSize(pdf.size)}</p>
                
                <div className="flex items-center text-xs text-gray-400">
                  <span>Uploaded {pdf.createdAt?.toDate ? pdf.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex space-x-2">
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <a
                    href={getDownloadUrl(pdf.url)}
                    download={pdf.name}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Download File"
                  >
                    <Download size={18} />
                  </a>
                </div>
                <button
                  onClick={() => setDeletingPdf(pdf)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete PDF"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete PDF</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deletingPdf.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingPdf(null)}
                className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
