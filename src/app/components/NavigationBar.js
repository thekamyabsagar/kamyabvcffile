"use client";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-3">
      {/* Profile icon */}
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 border border-gray-200"
        title="View Profile"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>
    </div>
  );
}
