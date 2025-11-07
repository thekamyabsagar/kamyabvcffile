"use client";

export default function CardTypeToggle({ cardType, onToggle }) {
  return (
    <div className="w-full mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
        Select Card Type
      </label>
      <div className="relative flex items-center justify-center bg-gray-100 rounded-full p-1 shadow-inner">
        {/* Background slider */}
        <div
          className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full shadow-md transition-transform duration-300 ease-in-out ${
            cardType === "double" ? "translate-x-full" : "translate-x-0"
          }`}
          style={{ left: "0.25rem" }}
        ></div>

        {/* Single-sided button */}
        <button
          type="button"
          onClick={() => onToggle("single")}
          className={`relative z-10 flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-colors duration-300 ${
            cardType === "single"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Single-Sided
        </button>

        {/* Double-sided button */}
        <button
          type="button"
          onClick={() => onToggle("double")}
          className={`relative z-10 flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-colors duration-300 ${
            cardType === "double"
              ? "text-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Double-Sided
        </button>
      </div>
      
      {/* Description text */}
      <p className="text-xs text-gray-500 text-center mt-3">
        {cardType === "single" 
          ? "Upload images with information on one side only" 
          : "Upload at least 2 photos: front and back of your card"}
      </p>
    </div>
  );
}
