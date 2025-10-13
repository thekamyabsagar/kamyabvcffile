"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProfileCompletionGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Skip redirect if already on complete-profile page or login page
      if (pathname === "/complete-profile" || pathname === "/login") {
        return;
      }

      // Check if profile is incomplete and redirect to complete profile
      if (session.user.isProfileComplete === false) {
        router.push("/complete-profile");
      }
    }
  }, [session, status, router, pathname]);

  return children;
}