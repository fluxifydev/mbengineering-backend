import { Pencil, Trash2, Calendar, Clock } from "lucide-react";

export default function BlogCard({ blog, onEdit, onDelete }) {
  const primaryImage = blog.coverImageUrl;

  // Format the date if available
  let formattedDate = "";
  if (blog.createdAt) {
    const d = new Date(blog.createdAt);
    if (!isNaN(d.getTime())) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      formattedDate = d.toLocaleDateString(undefined, options);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      <div className="relative h-48 w-full bg-gray-50 border-b border-gray-100">
        {primaryImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={primaryImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        {blog.tag && (
          <div className="absolute top-3 left-3 bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
            {blog.tag}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2.5">
          {formattedDate && (
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {formattedDate}
            </div>
          )}
          {formattedDate && blog.readTime && <span>&bull;</span>}
          {blog.readTime && (
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              {blog.readTime} min read
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-blue-900 mb-2 line-clamp-2 leading-tight" title={blog.title}>
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {blog.shortDescription}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(blog)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Blog"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(blog)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Blog"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
