"use client";

import { useState, useEffect } from "react";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/services/categoryService";
import { Plus, Trash2, Edit, X, FolderTree } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState([""]);
  
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setSubcategories([""]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSubcategories(cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories : [""]);
    setIsModalOpen(true);
  };

  const handleSubcategoryChange = (index, val) => {
    const newSubs = [...subcategories];
    newSubs[index] = val;
    setSubcategories(newSubs);
  };

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, ""]);
  };

  const handleRemoveSubcategory = (index) => {
    const newSubs = [...subcategories];
    newSubs.splice(index, 1);
    setSubcategories(newSubs);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanSubs = subcategories.map(s => s.trim()).filter(s => s !== "");
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name, cleanSubs);
      } else {
        await addCategory(name, cleanSubs);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert("Failed to save category.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId);
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage machine categories and subcategories</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderTree className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Organize your products by adding categories.</p>
          <button
            onClick={openAddModal}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-medium inline-flex transition-colors"
          >
            Add New Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(cat)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => setDeletingId(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-grow">
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium rounded-full">
                        {sub}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No subcategories</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                  placeholder="e.g. Lathe Machines"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Subcategories</label>
                </div>
                <div className="space-y-3">
                  {subcategories.map((sub, index) => (
                    <div key={index} className="flex space-x-3 items-center">
                      <input
                        type="text"
                        value={sub}
                        onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 text-sm"
                        placeholder="e.g. CNC Lathe"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} className="mr-1" />
                  Add Subcategory
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? Products using it will retain the text, but it won't appear in filters.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingId(null)}
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
