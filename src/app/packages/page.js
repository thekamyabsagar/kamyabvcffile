"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import PackageCard from "../components/PackageCard";
import { useRazorpay, initiatePayment } from "../utils/razorpay";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import PackagesPageHeader from "../components/PackagesPageHeader";
import FreeTrialNotice from "../components/FreeTrialNotice";
import AlertMessage from "../components/AlertMessage";

function PackagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isRazorpayLoaded = useRazorpay();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingPackage, setIsCheckingPackage] = useState(true);
  const [currentPackageData, setCurrentPackageData] = useState(null);

  useEffect(() => {
    // Check if this is a new user from URL params
    const newUserParam = searchParams.get("newUser");
    setIsNewUser(newUserParam === "true");
  }, [searchParams]);

  // Check user's package status and redirect if they have an active package
  useEffect(() => {
    if (status === "authenticated") {
      checkUserPackageStatus();
    } else if (status === "unauthenticated") {
      setIsCheckingPackage(false);
    } else if (status === "loading") {
      setIsCheckingPackage(true);
    }
  }, [status, router]);

  const checkUserPackageStatus = async () => {
    setIsCheckingPackage(true);
    try {
      // Check if user is coming from upgrade button
      const isUpgrade = searchParams.get("upgrade") === "true";
      
      const response = await fetch("/api/contacts/usage");
      if (response.ok) {
        const data = await response.json();
        // If user has no package, show the skip button
        if (data.status === "no-package" || data.hasPackage === false) {
          setIsNewUser(true);
          setCurrentPackageData(null);
          setIsCheckingPackage(false);
        } else if (data.status === "active" || data.status === "expired" || data.status === "exhausted") {
          // Store current package data
          setCurrentPackageData(data);
          
          // Allow access if coming from upgrade button
          if (isUpgrade) {
            setIsCheckingPackage(false);
            return;
          }
          // User has a package (active, expired, or exhausted), redirect to home
          router.replace("/");
        } else {
          setIsCheckingPackage(false);
        }
      } else {
        setIsCheckingPackage(false);
      }
    } catch (error) {
      console.error("Failed to check package status:", error);
      setIsCheckingPackage(false);
    }
  };

  const packages = [
    { 
      title: "Basic", 
      price: 1, 
      features: ["100 Contacts", "30 Days Access"],
      contactLimit: 100,
      validityDays: 30,
      tier: 1
    },
    { 
      title: "Standard", 
      price: 2, 
      features: ["200 Contacts", "180 Days Access"],
      contactLimit: 200,
      validityDays: 180,
      tier: 2
    },
    { 
      title: "Premium", 
      price: 3, 
      features: ["300 Contacts", "360 Days Access"],
      contactLimit: 300,
      validityDays: 360,
      tier: 3
    },
  ];

  // Helper function to determine package relationship
  const getPackageRelationship = (packageName) => {
    if (!currentPackageData || !currentPackageData.packageName) {
      return "upgrade"; // No package or trial - all are upgrades
    }

    const currentPkg = packages.find(p => p.title === currentPackageData.packageName);
    const targetPkg = packages.find(p => p.title === packageName);

    if (!currentPkg || !targetPkg) {
      return "upgrade";
    }

    if (currentPkg.tier === targetPkg.tier) {
      // If current package is exhausted, allow buying again
      if (currentPackageData.status === "exhausted") {
        return "buy-again";
      }
      return "current";
    } else if (targetPkg.tier > currentPkg.tier) {
      return "upgrade";
    } else {
      return "downgrade";
    }
  };

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

  // Show loader while checking package status
  if (status === "loading" || isCheckingPackage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size="12" />
          <p className="text-slate-600 mt-4">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[60px]">
      <div className="max-w-6xl mx-auto px-4">
        <PackagesPageHeader isNewUser={isNewUser} />

        {/* Success/Error Messages */}
        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((p, i) => {
            const relationship = getPackageRelationship(p.title);
            return (
              <PackageCard 
                key={i} 
                {...p} 
                onPurchase={handlePurchase}
                isLoading={isLoading}
                relationship={relationship}
                isCurrent={relationship === "current"}
                isBuyAgain={relationship === "buy-again"}
              />
            );
          })}
        </div>

        {/* Free Trial Notice */}
        <FreeTrialNotice 
          isNewUser={isNewUser}
          isLoading={isLoading}
          onSkip={handleSkip}
        />
      </div>
      <Footer />
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader size="12" />
          <p className="text-slate-600 mt-4">Loading packages...</p>
        </div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}
