"use client";

import { GrMoney } from "react-icons/gr";
import { useRouter } from "next/navigation";

export default function ProfilePackage({ packageInfo }) {
  const router = useRouter();

  if (!packageInfo) return null;

  return (
    <>
      {/* If user has a current package */}
      {packageInfo.currentPackage && (
        <div className="col-span-full mt-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
            
            {/* Header + Status */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="mr-2"><GrMoney /></span>
                Current Package
              </h3>

              <div className="flex items-center gap-3">
                {packageInfo.currentPackage.status === "active" && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                    Active
                  </span>
                )}

                {packageInfo.currentPackage.status === "expired" && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    Expired
                  </span>
                )}

                {packageInfo.currentPackage.status === "exhausted" && (
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                    Limit Exhausted
                  </span>
                )}

                {/* Show upgrade button if not Premium and status is active */}
                {packageInfo.currentPackage.status === "active" && 
                 packageInfo.currentPackage.name !== "Premium" && (
                  <button
                    onClick={() => router.push("/packages?upgrade=true")}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Package Name</p>
                <p className="text-lg font-bold text-purple-600">
                  {packageInfo.currentPackage.name}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Contacts</p>
                <p className="text-lg font-bold text-gray-800">
                  {packageInfo.currentPackage.contactsUsed || 0} / {packageInfo.currentPackage.contactLimit}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Expires On</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date(packageInfo.currentPackage.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Renew / Upgrade */}
            {(packageInfo.currentPackage.status === "expired" ||
              packageInfo.currentPackage.status === "exhausted") && (
              <div className="mt-4">
                <button
                  onClick={() => router.push("/packages?upgrade=true")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                >
                  {packageInfo.currentPackage.status === "expired"
                    ? "Renew Package"
                    : "Upgrade Package"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* If no package */}
      {!packageInfo.currentPackage && (
        <div className="col-span-full mt-4">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 text-center">
            <p className="text-gray-700 mb-4">You don't have an active package.</p>
            <button
              onClick={() => router.push("/packages")}
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
            >
              View Packages
            </button>
          </div>
        </div>
      )}
    </>
  );
}
