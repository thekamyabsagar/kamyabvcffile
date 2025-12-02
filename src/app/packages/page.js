"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import PackageCard from "../components/PackageCard";
import { useRazorpay, initiatePayment } from "../utils/razorpay";
import toast from "react-hot-toast";

export default function PackagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isRazorpayLoaded = useRazorpay();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if this is a new user from URL params
    const newUserParam = searchParams.get("newUser");
    setIsNewUser(newUserParam === "true");
  }, [searchParams]);

  // Also check user's package status to show skip button
  useEffect(() => {
    if (status === "authenticated") {
      checkUserPackageStatus();
    }
  }, [status]);

  const checkUserPackageStatus = async () => {
    try {
      const response = await fetch("/api/contacts/usage");
      if (response.ok) {
        const data = await response.json();
        // If user has no package, show the skip button
        if (data.status === "no-package" || !data.hasPackage) {
          setIsNewUser(true);
        }
      }
    } catch (error) {
      console.error("Failed to check package status:", error);
    }
  };

  const packages = [
    { 
      title: "Basic", 
      price: 1, 
      features: ["100 Contacts", "30 Days Access"],
      contactLimit: 100,
      validityDays: 30
    },
    { 
      title: "Standard", 
      price: 2, 
      features: ["200 Contacts", "180 Days Access"],
      contactLimit: 200,
      validityDays: 180
    },
    { 
      title: "Premium", 
      price: 3, 
      features: ["300 Contacts", "360 Days Access"],
      contactLimit: 300,
      validityDays: 360
    },
  ];

  const handlePurchase = async ({ packageName, contactLimit, validityDays, price }) => {
    // Check if user is logged in
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if Razorpay is loaded
    if (!isRazorpayLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await initiatePayment({
        amount: price,
        packageName,
        contactLimit,
        validityDays,
        userEmail: session?.user?.email,
        userName: session?.user?.name || session?.user?.email,
        onSuccess: (data) => {
          setSuccess(`Successfully purchased ${packageName} package!`);
          toast.success(`Payment successful! ${packageName} package activated.`);
          setTimeout(() => {
            router.push("/");
          }, 2000);
          setIsLoading(false);
        },
        onFailure: (error) => {
          const errorMsg = error.message || "Payment failed. Please try again.";
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
        },
      });
    } catch (error) {
      setError("Error initiating payment. Please try again.");
      toast.error("Error initiating payment. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Activate free trial
      const response = await fetch("/api/packages/activate-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Free trial activated! Redirecting to home...");
        toast.success("Free trial activated! Welcome aboard! 🎉");
        // Wait longer to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Use router.push instead of window.location for smoother navigation
        router.push("/");
        // Force refresh contact info after navigation
        window.location.href = "/";
      } else {
        setError(data.message || "Failed to activate free trial");
        toast.error(data.message || "Failed to activate free trial");
      }
    } catch (error) {
      setError("Error activating free trial");
      toast.error("Error activating free trial");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
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

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 max-w-2xl mx-auto">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 text-center text-green-600 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <PackageCard 
              key={i} 
              {...p} 
              onPurchase={handlePurchase}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Free Trial Notice */}
        <div className="mt-12 text-center bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
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
              onClick={handleSkip}
              disabled={isLoading}
              className="mt-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Activating..." : "Skip & Start with Free Trial"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
