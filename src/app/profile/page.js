"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";
import Link from "next/link";
import ProfilePackage from "../components/ProfilePackage";
import Logo from "../components/Logo";
import { CiUser, CiMail, CiCalendar, CiLogout } from "react-icons/ci";
import { HiArrowLeft, HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineGlobeAlt, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import Footer from "../components/Footer";
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-pulse text-slate-600">
          <Loader size="12" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-8 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 text-black-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Page Title with Sign Out */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <button
            onClick={async () => {
              setIsLoggingOut(true);
              await signOut({ redirect: true, callbackUrl: "/login" });
            }}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-blue-800 transition-colors"
          >
            <CiLogout className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/50">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <CiUser className="w-5 h-5 text-indigo-600" />
                  Profile Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isEditing ? "Update your personal information" : "Your personal details"}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Username</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CiUser className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{userProfile.username || "Not set"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CiMail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{session?.user?.email}</span>
                  </div>
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Country</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <HiOutlineGlobeAlt className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{userProfile.country || "Not set"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{userProfile.phoneNumber || "Not set"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company Name</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <HiOutlineOfficeBuilding className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{userProfile.companyName || "Not set"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    value={editForm.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700">
                      Country *
                    </label>
                    <input
                      id="country"
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={editForm.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">
                      Phone Number *
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      value={editForm.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    value={editForm.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    <HiOutlineCheck className="w-4 h-4" />
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/50">
          <div className="p-6 border-b border-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <CiCalendar className="w-5 h-5 text-indigo-600" />
              Account Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Member since</span>
              <span className="font-medium text-slate-900">
                {userProfile.createdAt
                  ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-600">Last updated</span>
              <span className="font-medium text-slate-900">
                {userProfile.updatedAt
                  ? new Date(userProfile.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Package Information */}
        <ProfilePackage packageInfo={packageInfo} />

      </main>
      <Footer />
    </div>
  );
}
