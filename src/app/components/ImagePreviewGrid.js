"use client";

export default function ImagePreviewGrid({ imagePreviews, onDeleteImage }) {
  if (imagePreviews.length === 0) return null;

  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-3 gap-3">
        {imagePreviews.map((preview, idx) => (
          <div key={idx} className="relative group">
            <img
              src={preview.url}
              alt={`Preview ${idx + 1}`}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => onDeleteImage(idx)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate rounded-b-lg">
              {preview.file.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
