"use client";
import { TiTick } from "react-icons/ti";
export default function PackageCard({ title, price, features, contactLimit, validityDays, onPurchase, isLoading }) {
  return (
    <div className="border p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
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
        onClick={() => onPurchase({ 
          packageName: title, 
          contactLimit, 
          validityDays, 
          price 
        })}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
}
