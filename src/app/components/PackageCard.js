"use client";
import { TiTick } from "react-icons/ti";
import { FaCrown } from "react-icons/fa";

export default function PackageCard({ 
  title, 
  price, 
  features, 
  contactLimit, 
  validityDays, 
  onPurchase, 
  isLoading,
  relationship = "upgrade",
  isCurrent = false,
  isBuyAgain = false
}) {
  const getButtonText = () => {
    if (isCurrent) return "Current Plan";
    if (isBuyAgain) return "Buy Again";
    if (relationship === "upgrade") return "Upgrade Now";
    if (relationship === "downgrade") return "Downgrade";
    return "Buy Now";
  };

  const getButtonStyle = () => {
    if (isCurrent) {
      return "w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold shadow-lg cursor-not-allowed";
    }
    if (isBuyAgain) {
      return "w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
    }
    if (relationship === "upgrade") {
      return "w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
    }
    if (relationship === "downgrade") {
      return "w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
    }
    return "w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  };

  return (
    <div className={`border p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 relative ${
      isCurrent ? "border-purple-500 border-2 bg-gradient-to-br from-purple-50 to-pink-50" : ""
    } ${isBuyAgain ? "border-orange-500 border-2 bg-gradient-to-br from-orange-50 to-yellow-50" : ""}`}>
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <FaCrown className="text-yellow-300" size={14} />
          Current Plan
        </div>
      )}

      {/* Exhausted Badge */}
      {isBuyAgain && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          ⚠️ Exhausted
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-4xl font-semibold my-3 text-purple-600">₹{price}</p>

      <ul className="mb-4 space-y-2">
        {features.map((f, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2"><TiTick size={25}/></span>
            <span className="text-gray-700">{f}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => !isCurrent && onPurchase({ 
          packageName: title, 
          contactLimit, 
          validityDays, 
          price 
        })}
        disabled={isLoading || isCurrent}
        className={getButtonStyle()}
      >
        {isLoading ? "Processing..." : getButtonText()}
      </button>
    </div>
  );
}
