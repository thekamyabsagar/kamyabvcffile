"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Loader from "../components/Loader";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session, router]);

  // When password becomes empty, automatically hide it and keep the toggle inactive
  useEffect(() => {
    if (password.trim().length === 0 && showPassword) {
      setShowPassword(false);
    }
  }, [password, showPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isLogin) {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/",
        });
        if (result?.error) {
          // Generic error message for all login failures
          setError("Incorrect password or user does not exist. Please signup if you are new.");
          // Clear password field for security
          setPassword("");
          setShowPassword(false);
        } else {
          router.push("/");
        }
      } catch (error) {
        // Generic error for any other errors
        setError("Incorrect password or user does not exist. Please signup if you are new.");
        setPassword("");
        setShowPassword(false);
      }
    } else {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            username,
            country,
            phoneNumber,
            companyName,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Auto login after successful signup
          const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });
          if (result?.error) {
            setError("Signup successful but auto-login failed. Please log in manually.");
            setIsLogin(true);
          } else {
            // Redirect new users to packages page
            router.push("/packages?newUser=true");
          }
        } else {
          setError(data.message || "Signup failed");
        }
      } catch (err) {
        setError("An error occurred during signup.");
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/",
      redirect: true,
    });
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setCountry("");
    setPhoneNumber("");
    setCompanyName("");
    setError("");
    setShowPassword(false);
  };

  // While NextAuth session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="12" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Edge/IE */
        input::-ms-reveal, input::-ms-clear { display: none; }
        /* Chrome/Safari - attempts to hide credential/autofill/reveal buttons */
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-autofill-button,
        input::-webkit-textfield-decoration-container {
          display: none !important;
          -webkit-appearance: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Logo size="lg" />
            <p className="text-slate-600 text-center">
              Convert business cards to VCF contacts instantly
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-slate-600 text-sm">
                  {isLogin
                    ? "Enter your credentials to access your account"
                    : "Enter your details to create your account"}
                </p>
              </div>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Hapy_One"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      className={`w-full px-4 py-2.5 ${password.trim().length > 0 ? 'pr-12' : 'pr-4'} bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      aria-describedby="password-toggle"
                    />
                    {password.trim().length > 0 && (
                      <button
                        id="password-toggle"
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-pressed={showPassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none"
                        disabled={isLoading}
                      >
                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        {showPassword ? (
                          <IoEyeOffOutline size={20} />
                        ) : (
                          <IoEyeOutline size={20} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium text-slate-700">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        autoComplete="country"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="India"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        autoComplete="tel"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                        Company Name
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Kamyab Infotech PVT LTD"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-5 w-5" />
                Sign {isLogin ? "in" : "up"} with Google
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
