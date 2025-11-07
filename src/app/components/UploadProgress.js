"use client";

export default function UploadProgress({ imageCount }) {
  return (
    <div className="w-full py-8 px-4 flex flex-col items-center justify-center">
      {/* Animated circular progress */}
      <div className="relative w-32 h-32 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg 
              className="w-10 h-10 text-blue-600 mx-auto mb-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">Processing Your Images</h3>
        <p className="text-sm text-gray-600">
          Converting {imageCount} {imageCount === 1 ? 'image' : 'images'} to VCF format...
        </p>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center space-x-1 pt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
      </div>

      <p className="text-xs text-gray-500 mt-4">Please wait, this may take a moment...</p>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
