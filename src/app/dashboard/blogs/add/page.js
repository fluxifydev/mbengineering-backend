"use client";

import { useState } from "react";
import { addBlog } from "@/services/blogService";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Plus, Trash2, Type, Heading1, Heading2, Heading3, Heading4 } from "lucide-react";
import Link from "next/link";

export default function AddBlog() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tag, setTag] = useState("");
  const [readTime, setReadTime] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  
  // Dynamic Content Builder
  const [blocks, setBlocks] = useState([
    { type: "h1", content: "" },
    { type: "p", content: "" }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`Image "${file.name}" is larger than 4MB. Please select a smaller image.`);
        return;
      }
      setCoverImageFile(file);
    }
  };

  const addBlock = (type) => {
    setBlocks([...blocks, { type, content: "" }]);
  };

  const removeBlock = (index) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const updateBlock = (index, val) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = val;
    setBlocks(newBlocks);
  };

  const moveBlock = (index, direction) => {
    if (direction === "up" && index > 0) {
      const newBlocks = [...blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = temp;
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = temp;
      setBlocks(newBlocks);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!coverImageFile) {
      setError("Please select a cover image for the blog.");
      setLoading(false);
      return;
    }

    // Filter out empty blocks
    const cleanedBlocks = blocks.filter(b => b.content.trim() !== "");

    try {
      await addBlog(
        { title, shortDescription, tag, readTime: Number(readTime), content: cleanedBlocks },
        coverImageFile
      );
      router.push("/dashboard/blogs");
    } catch (err) {
      setError(err.message || "Failed to add blog");
      setLoading(false);
    }
  };

  const renderBlockIcon = (type) => {
    switch(type) {
      case "h1": return <Heading1 size={18} className="text-blue-600" />;
      case "h2": return <Heading2 size={18} className="text-blue-600" />;
      case "h3": return <Heading3 size={18} className="text-blue-600" />;
      case "h4": return <Heading4 size={18} className="text-blue-600" />;
      case "p": return <Type size={18} className="text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link 
          href="/dashboard/blogs" 
          className="mr-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Write New Blog</h1>
          <p className="text-gray-500 mt-1">Create an engineering insight or technical guide</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Main Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 font-bold text-lg"
                placeholder="e.g. Optimizing Tension Control in Slitter Machinery"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tag / Category *</label>
              <input
                type="text"
                required
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 uppercase text-sm"
                placeholder="e.g. Technical Guide"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description (Card) *</label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 resize-none"
                placeholder="A deep dive into closed-loop tension control..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Read Time (Mins) *</label>
              <input
                type="number"
                required
                min="1"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                placeholder="e.g. 6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a cover image</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Will be used on the card and the full article.</p>
              {coverImageFile && (
                <p className="mt-3 text-sm font-medium text-blue-600 truncate bg-blue-50 py-1.5 px-3 rounded inline-block">{coverImageFile.name}</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dynamic Content Builder</h3>
            <p className="text-sm text-gray-500 mb-6">Build your blog post by adding headings and paragraphs below.</p>
            
            <div className="space-y-4 mb-6">
              {blocks.map((block, index) => (
                <div key={index} className="flex gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 group transition-all focus-within:border-blue-200 focus-within:bg-blue-50/20">
                  <div className="pt-3 px-2 flex flex-col items-center space-y-2">
                    <div className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-md">
                      {renderBlockIcon(block.type)}
                    </div>
                    <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => moveBlock(index, "up")} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveBlock(index, "down")} disabled={index === blocks.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">↓</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    {block.type.startsWith("h") ? (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => updateBlock(index, e.target.value)}
                        placeholder={`Type your ${block.type.toUpperCase()} heading here...`}
                        className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 ${
                          block.type === 'h1' ? 'font-bold text-xl' :
                          block.type === 'h2' ? 'font-bold text-lg' :
                          block.type === 'h3' ? 'font-semibold text-md' : 'font-medium text-base'
                        }`}
                      />
                    ) : (
                      <textarea
                        rows={4}
                        value={block.content}
                        onChange={(e) => updateBlock(index, e.target.value)}
                        placeholder="Write your paragraph here..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-700 resize-none leading-relaxed"
                      />
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start opacity-0 group-hover:opacity-100"
                    title="Remove block"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => addBlock("h1")} className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors border border-blue-100"><Heading1 size={16} className="mr-1.5" /> Add H1</button>
              <button type="button" onClick={() => addBlock("h2")} className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors border border-blue-100"><Heading2 size={16} className="mr-1.5" /> Add H2</button>
              <button type="button" onClick={() => addBlock("h3")} className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors border border-blue-100"><Heading3 size={16} className="mr-1.5" /> Add H3</button>
              <button type="button" onClick={() => addBlock("h4")} className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors border border-blue-100"><Heading4 size={16} className="mr-1.5" /> Add H4</button>
              <button type="button" onClick={() => addBlock("p")} className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors border border-gray-200"><Type size={16} className="mr-1.5" /> Add Paragraph</button>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end space-x-4">
            <Link
              href="/dashboard/blogs"
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
              ) : "Publish Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
