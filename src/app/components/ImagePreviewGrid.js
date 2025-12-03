"use client";

export default function ImagePreviewGrid({ imagePreviews, onDeleteImage }) {
  if (!imagePreviews || imagePreviews.length === 0) return null;

  // Sanitize filename to prevent XSS
  const sanitizeFileName = (name) => {
    if (!name || typeof name !== 'string') return 'Unnamed file';
    // Remove any HTML tags and limit length
    return name.replace(/<[^>]*>/g, '').substring(0, 50);
  };

  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-3 gap-3">
        {imagePreviews.map((preview, idx) => {
          // Validate preview object
          if (!preview || !preview.url || !preview.file) {
            return null;
          }

          return (
            <div key={idx} className="relative group">
              <img
                src={preview.url}
                alt={`Preview ${idx + 1}`}
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  // Handle broken image
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                }}
              />
              <button
                onClick={() => onDeleteImage(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                title="Remove image"
                aria-label={`Remove image ${idx + 1}`}
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
                {sanitizeFileName(preview.file.name)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
