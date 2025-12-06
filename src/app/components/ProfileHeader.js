"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CiLogout } from "react-icons/ci";
import { HiArrowLeft } from "react-icons/hi";
import Logo from "./Logo";

export const ProfileHeader = ({ onSignOut, isLoggingOut }) => {
  const router = useRouter();
  
  return (
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
  );
};

export const ProfilePageHeader = ({ onSignOut, isLoggingOut }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      <button
        onClick={onSignOut}
        disabled={isLoggingOut}
        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-blue-800 transition-colors disabled:opacity-50"
      >
        <CiLogout className="w-4 h-4" />
        {isLoggingOut ? "Signing Out..." : "Sign Out"}
      </button>
    </div>
  );
};
