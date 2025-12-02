"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import Loader from "../components/Loader";
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

      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
            {isLogin ? "Welcome Back!" : "Join Us Today!"}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {isLogin ? "Sign in to your account" : "Create your new account"}
          </p>

          {error && (
            <div role="alert" className="mb-4 text-center text-red-500 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Password field - note larger right padding to fit the toggle */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className={`appearance-none relative block w-full px-4 py-3 ${password.trim().length > 0 ? 'pr-14' : 'pr-4'} border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-describedby="password-toggle"
              />

              {/* Render toggle only when there's content */}
              {password.trim().length > 0 && (
                <button
                  id="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  onMouseDown={(e) => e.preventDefault()} // prevent input losing focus / native interference
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 z-20 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  {showPassword ? (
                    <IoEyeOffOutline size={24} />
                  ) : (
                    <IoEyeOutline size={24} />
                  )}
                </button>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="country" className="sr-only">Country</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    autoComplete="country"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="sr-only">Company Name</label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg transition duration-200"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
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
                "Sign Up"
              )}
              </button>
            </div>
          </form>

          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google logo" className="h-6 w-6 mr-3" />
              Sign {isLogin ? "in" : "up"} with Google
            </button>
          </div>

          <div className="mt-8 text-center text-gray-600">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); resetForm(); }}
                  className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); resetForm(); }}
                  className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
