"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CiUser } from "react-icons/ci";
import Logo from "./Logo";

const Header = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="w-full py-6 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, 'features')}
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
            className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            How It Works
          </a>
          {!loading && (
            <>
              {session?.user ? (
                <Link href="/profile">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm">
                    <CiUser className="w-4 h-4" />
                    Profile
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Sign In
                  </button>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
