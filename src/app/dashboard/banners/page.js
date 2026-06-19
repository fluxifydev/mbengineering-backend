"use client";

import { useState, useEffect } from "react";
import { getBanners, deleteBanner } from "@/services/bannerService";
import BannerCard from "@/components/BannerCard";
import AddBannerModal from "@/components/AddBannerModal";
import EditBannerModal from "@/components/EditBannerModal";
import { Plus, Images } from "lucide-react";

export default function BannersDashboard() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingBanner, setDeletingBanner] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setError(err.message || "Failed to fetch banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async () => {
    if (!deletingBanner) return;
    try {
      await deleteBanner(deletingBanner.id, deletingBanner.imageUrl);
      setDeletingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Failed to delete banner", error);
      alert("Failed to delete banner.");
    }
  };

  const isLimitReached = banners.length >= 6;

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
          <p className="text-gray-500 mt-1">
            Manage the homepage slider. Max 6 slides allowed. ({banners.length}/6)
          </p>
        </div>
        {!isLimitReached && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            Add Slide
          </button>
        )}
        {isLimitReached && (
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium border border-orange-100 flex items-center">
            Slide Limit Reached (6/6)
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold mb-1">Error Loading Banners</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Images className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No slides found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first hero banner slide.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-medium inline-flex transition-colors"
          >
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              index={index}
              onEdit={setEditingBanner}
              onDelete={setDeletingBanner}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddBannerModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchBanners();
          }}
        />
      )}

      {editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          onClose={() => setEditingBanner(null)}
          onSave={() => {
            setEditingBanner(null);
            fetchBanners();
          }}
        />
      )}

      {deletingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Slide</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the slide <span className="font-semibold text-gray-900">&quot;{deletingBanner.heading}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingBanner(null)}
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
