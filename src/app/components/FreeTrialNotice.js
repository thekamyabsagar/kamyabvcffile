"use client";

const FreeTrialNotice = ({ isNewUser, isLoading, onSkip }) => {
  return (
    <div className="mt-12 mb-12 text-center bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {isNewUser ? "🎉 Free Trial Included!" : "New User Bonus!"}
      </h3>
      <p className="text-gray-600 mb-4">
        {isNewUser
          ? "Not ready to buy? No problem! Get started with our free trial - 100 contacts for 30 days, absolutely free!"
          : "All new users automatically receive a 30-day free trial with 100 contacts upon registration!"
        }
      </p>
      {isNewUser && (
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="mt-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Activating..." : "Skip & Start with Free Trial"}
        </button>
      )}
    </div>
  );
};

export default FreeTrialNotice;
