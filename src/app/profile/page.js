"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";
import { GrMoney } from "react-icons/gr";
import ProfilePackage from "../components/ProfilePackage";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    country: "",
    phoneNumber: "",
    companyName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchUserProfile();
    }
  }, [status, session, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const [profileResponse, packageResponse] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/packages/purchase")
      ]);
      
      if (profileResponse.ok) {
        const data = await profileResponse.json();
        setUserProfile(data);
        setEditForm({
          username: data.username || "",
          country: data.country || "",
          phoneNumber: data.phoneNumber || "",
          companyName: data.companyName || "",
        });
      } else {
        setError("Failed to fetch profile");
      }

      if (packageResponse.ok) {
        const packageData = await packageResponse.json();
        setPackageInfo(packageData);
      }
    } catch (error) {
      setError("Error fetching profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setUserProfile(prev => ({ ...prev, ...editForm }));
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        // Update the session
        await update();
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (status === "loading" || isLoading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
        <Loader size="12" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              setIsLoggingOut(true);
              await signOut({ redirect: true, callbackUrl: "/login" });
            }}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200 text-sm font-medium border border-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {session?.user?.name ? 
                session.user.name.charAt(0).toUpperCase() : 
                session?.user?.email?.charAt(0).toUpperCase() || "U"
              }
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {session?.user?.name || userProfile.username || "User Profile"}
            </h1>
            <p className="text-gray-600">{session?.user?.email}</p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-3 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 text-center text-green-500 bg-green-50 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          {/* Profile Content */}
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <p className="text-gray-900 font-semibold">{userProfile.username || "Not set"}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <p className="text-gray-900 font-semibold">{userProfile.country || "Not set"}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900 font-semibold">{userProfile.phoneNumber || "Not set"}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <p className="text-gray-900 font-semibold">{userProfile.companyName || "Not set"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 font-semibold">{session?.user?.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900 font-semibold">
                  {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {/* Current Package Section
              {packageInfo?.currentPackage && (
                <div className="col-span-full mt-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2"><GrMoney /></span>
                        Current Package
                      </h3>
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
                    </div>
                    
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

                    {(packageInfo.currentPackage.status === "expired" || packageInfo.currentPackage.status === "exhausted") && (
                      <div className="mt-4">
                        <button
                          onClick={() => router.push("/packages")}
                          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                        >
                          {packageInfo.currentPackage.status === "expired" ? "Renew Package" : "Upgrade Package"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!packageInfo?.currentPackage && (
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
              )} */}

              <ProfilePackage packageInfo={packageInfo} />

              <div className="pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                    value={editForm.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                    value={editForm.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                    value={editForm.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      username: userProfile.username || "",
                      country: userProfile.country || "",
                      phoneNumber: userProfile.phoneNumber || "",
                      companyName: userProfile.companyName || "",
                    });
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-lg disabled:opacity-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
