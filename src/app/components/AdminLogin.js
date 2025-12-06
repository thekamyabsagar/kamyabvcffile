"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Logo from "../components/Logo";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const router = useRouter();

  // Setup admin user on mount
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        const response = await fetch("/api/admin/setup", {
          method: "POST",
        });
        
        if (!response.ok) {
          console.warn("Admin setup failed with status:", response.status);
          setSetupComplete(true);
          return;
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Admin setup:", data);
        }
        
        setSetupComplete(true);
      } catch (error) {
        console.error("Admin setup error:", error);
        setSetupComplete(true); // Continue anyway
      }
    };
    setupAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with NextAuth credentials provider
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // Check if user has admin role
        const adminCheckResponse = await fetch("/api/admin/auth");
        
        if (!adminCheckResponse.ok) {
          toast.error("Failed to verify admin status");
          setLoading(false);
          return;
        }
        
        const adminData = await adminCheckResponse.json();

        if (adminData.isAdmin) {
          toast.success("Admin login successful!");
          // Reload page to refresh session and show dashboard
          window.location.reload();
        } else {
          toast.error("This account does not have admin privileges");
          setLoading(false);
        }
      } else {
        toast.error("Invalid credentials. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Admin login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Admin Access
            </h1>
            <p className="text-slate-600">
              Enter your admin credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email / Username
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Enter admin email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Enter admin password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Sign In as Admin"}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-slate-600 hover:text-indigo-600 transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          {/* Default Credentials Info (only for development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium mb-1">
                Development Mode - Default Credentials:
              </p>
              <p className="text-xs text-yellow-700">
                Email: <span className="font-mono">admin@admin.com</span>
              </p>
              <p className="text-xs text-yellow-700">
                Password: <span className="font-mono">admin123</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
