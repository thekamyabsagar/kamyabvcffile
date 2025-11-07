"use client";

export default function FileUploadInput({ hasImages, onFileSelect }) {
  return (
    <label
      htmlFor="file-upload"
      className="cursor-pointer w-full flex flex-col items-center justify-center py-6 px-4 mb-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 shadow-sm"
    >
      <svg
        width="40"
        height="40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="mb-2 text-blue-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12l4-4m0 0l4 4m-4-4v12"
        />
      </svg>
      <span className="text-blue-700 font-medium">
        {hasImages ? "Choose Another" : "Choose Photos"}
      </span>
      <span className="text-xs text-gray-500 mt-1">
        (You can select multiple images)
      </span>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={onFileSelect}
        className="hidden"
      />
    </label>
  );
}
