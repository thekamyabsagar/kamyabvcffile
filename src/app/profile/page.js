"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";
import ProfilePackage from "../components/ProfilePackage";
import { ProfileHeader, ProfilePageHeader } from "../components/ProfileHeader";
import ProfileInfoDisplay from "../components/ProfileInfoDisplay";
import ProfileEditForm from "../components/ProfileEditForm";
import AccountDetails from "../components/AccountDetails";
import AlertMessage from "../components/AlertMessage";
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
    } else if (status === "loading") {
      setIsLoading(true);
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: userProfile.username || "",
      country: userProfile.country || "",
      phoneNumber: userProfile.phoneNumber || "",
      companyName: userProfile.companyName || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  if (status === "loading" || isLoading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader size="12" />
          <p className="text-slate-600 mt-4">
            {isLoggingOut ? "Signing out..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ProfileHeader onSignOut={handleSignOut} isLoggingOut={isLoggingOut} />

      <main className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Page Title with Sign Out */}
        <ProfilePageHeader onSignOut={handleSignOut} isLoggingOut={isLoggingOut} />

        {/* Success/Error Messages */}
        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />

        {/* Profile Information Card */}
        {!isEditing ? (
          <ProfileInfoDisplay 
            userProfile={userProfile}
            email={session?.user?.email}
            onEditClick={() => setIsEditing(true)}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50">
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Profile Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update your personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ProfileEditForm
                editForm={editForm}
                isSaving={isSaving}
                onSubmit={handleEditSubmit}
                onChange={handleInputChange}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

        {/* Account Details Card */}
        <AccountDetails 
          createdAt={userProfile.createdAt}
          updatedAt={userProfile.updatedAt}
        />

        {/* Package Information */}
        <ProfilePackage packageInfo={packageInfo} />

      </main>
      <Footer />
    </div>
  );
}
