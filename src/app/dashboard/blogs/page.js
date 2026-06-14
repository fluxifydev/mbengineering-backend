"use client";

import { useState, useEffect } from "react";
import { getBlogs, deleteBlog } from "@/services/blogService";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, BookOpen } from "lucide-react";

export default function BlogsDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setError(err.message || "Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEdit = (blog) => {
    router.push(`/dashboard/blogs/edit/${blog.id}`);
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;
    try {
      await deleteBlog(deletingBlog.id, deletingBlog.coverImageUrl);
      setDeletingBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog", error);
      alert("Failed to delete blog.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-500 mt-1">Manage your Engineering Insights & Articles</p>
        </div>
        <Link
          href="/dashboard/blogs/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Add Blog
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold mb-1">Error Loading Blogs</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first blog article.</p>
          <Link
            href="/dashboard/blogs/add"
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg font-medium inline-flex transition-colors"
          >
            Add New Blog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={setDeletingBlog}
            />
          ))}
        </div>
      )}

      {deletingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Blog</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deletingBlog.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingBlog(null)}
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
