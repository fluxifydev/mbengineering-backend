import { Pencil, Trash2 } from "lucide-react";

export default function BannerCard({ banner, onEdit, onDelete, index }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full pb-[56.25%] bg-gray-900 border-b border-gray-100 overflow-hidden">
        {banner.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={banner.imageUrl}
            alt={banner.heading}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Overlay gradient for text readability (matches the style of the site) */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent p-5 flex flex-col justify-center">
          <div className="max-w-[70%]">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-2 leading-tight line-clamp-2">
              {banner.heading}
            </h3>
            <p className="text-blue-50 text-xs sm:text-sm line-clamp-3 opacity-90 leading-relaxed">
              {banner.description}
            </p>
          </div>
        </div>

        {/* Slide Number Badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
          Slide {index + 1}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium truncate pr-2">
            Created: {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : 'Just now'}
          </span>
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={() => onEdit(banner)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Slide"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(banner)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Slide"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
