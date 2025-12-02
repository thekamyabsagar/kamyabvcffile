"use client";
import { useState } from "react";

export default function ConsentDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cardType,
  imageCount 
}) {
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = () => {
    if (accepted) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900">Confirm Card Type</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50/70 backdrop-blur-sm p-4 rounded-lg border border-blue-100">
            <p className="text-blue-800 font-medium">
              You've selected: <span className="font-bold">{cardType === "single" ? "Single" : "Double"}-sided</span> business card processing
            </p>
            <p className="text-blue-700 mt-2 text-sm">
              Number of images selected: {imageCount}
            </p>
            <p className="text-blue-900 mt-2 font-semibold text-lg">
              Contacts to be used: {cardType === "single" ? imageCount : Math.ceil(imageCount / 2)}
            </p>
            {cardType === "double" && (
              <p className="text-blue-600 mt-1 text-xs italic">
                (2 images = 1 contact)
              </p>
            )}
          </div>

          {cardType === "single" && imageCount > 1 && (
            <div className="bg-yellow-50/70 backdrop-blur-sm p-4 rounded-lg border border-yellow-100 text-yellow-800">
              <p className="font-medium">⚠️ Important Notice</p>
              <p className="mt-1 text-sm">
                You've uploaded multiple images but selected single-sided processing. 
                Each image will be processed as a separate contact.
              </p>
            </div>
          )}

          {cardType === "double" && imageCount === 1 && (
            <div className="bg-red-50/70 backdrop-blur-sm p-4 rounded-lg border border-red-100 text-red-800">
              <p className="font-medium">⚠️ Warning</p>
              <p className="mt-1 text-sm">
                Double-sided processing requires both front and back images of your business card.
                Please upload both sides for accurate processing.
              </p>
            </div>
          )}

          <div className="space-y-4 bg-gray-50/70 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
            <p className="text-gray-700 font-medium">Terms and Conditions:</p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>I confirm that I have selected the correct card type for processing.</li>
              <li>I understand that incorrect card type selection may affect the quality of contact extraction.</li>
              <li>For double-sided cards, I confirm that I have uploaded both front and back images in the correct order.</li>
              <li>I acknowledge that the service will process the images according to my selected preferences.</li>
            </ul>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I have read and agree to the terms and conditions, and I confirm that my card type selection is correct.
            </label>
          </div>
        </div>

        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100/80 backdrop-blur-sm rounded-lg hover:bg-gray-200/80 transition-colors border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!accepted}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 ${
              accepted
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg"
                : "bg-gray-300/80 backdrop-blur-sm cursor-not-allowed"
            }`}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}