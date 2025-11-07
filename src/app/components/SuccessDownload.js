"use client";

export default function SuccessDownload({ outputUrl, onConvertAnother }) {
  return (
    <div className="w-full space-y-3 mt-4">
      <div className="flex items-center justify-center text-green-600 mb-2">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-center text-gray-700 font-medium mb-4">
        Your VCF file is ready!
      </p>
      <a
        href={outputUrl}
        download="Contact.vcf"
        className="block w-full py-3 rounded-xl bg-green-500 text-white font-bold text-center shadow-lg hover:bg-green-600 transition-all duration-200"
      >
        Download .vcf File
      </a>
      <button
        onClick={onConvertAnother}
        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-center shadow-md hover:bg-gray-200 transition-all duration-200"
      >
        Convert Another
      </button>
    </div>
  );
}
