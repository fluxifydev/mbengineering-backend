import { FileText, Pencil, Trash2 } from "lucide-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      <div className="relative h-56 w-full bg-gray-50 border-b border-gray-100">
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            {product.brochureUrl && (
              <a
                href={product.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                title="View Brochure"
              >
                <FileText size={14} className="mr-1.5" />
                Brochure
              </a>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit Product"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Product"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
