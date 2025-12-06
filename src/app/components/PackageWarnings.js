"use client";
import { useRouter } from "next/navigation";

export const ExhaustedWarning = () => {
  const router = useRouter();
  
  return (
    <div className="w-full mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <p className="text-sm text-orange-700 text-center font-semibold mb-2">
        ⚠️ Contact limit exhausted! Please upgrade your package to continue.
      </p>
      <button
        onClick={() => router.push("/packages?upgrade=true")}
        className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm"
      >
        Upgrade Package
      </button>
    </div>
  );
};

export const ExpiredWarning = () => {
  const router = useRouter();
  
  return (
    <div className="w-full mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-sm text-red-600 text-center font-semibold mb-2">
        Your package has expired. Please purchase a new package to continue.
      </p>
      <button
        onClick={() => router.push("/packages")}
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm"
      >
        Renew Package
      </button>
    </div>
  );
};

export const NoPackageWarning = () => {
  const router = useRouter();
  
  return (
    <div className="w-full mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <p className="text-sm text-yellow-700 text-center font-semibold mb-3">
        ⚠️ No active package found. Please select a package to continue.
      </p>
      <button
        onClick={() => router.push("/packages")}
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm"
      >
        View Packages
      </button>
    </div>
  );
};
