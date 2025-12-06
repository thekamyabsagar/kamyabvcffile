"use client";

const PackagesPageHeader = ({ isNewUser }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {isNewUser ? "Welcome! Choose Your Package" : "Choose Your Package"}
      </h1>
      <p className="text-gray-600 text-lg">
        {isNewUser 
          ? "Select a plan to get started, or skip to use the free trial with 100 contacts for 30 days!"
          : "Select the perfect plan for your needs. New users get 30 days free trial!"
        }
      </p>
    </div>
  );
};

export default PackagesPageHeader;
