"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuth = pathname === "/login" || pathname === "/signup";

  return (
    <main className={`relative z-10 min-h-screen ${isApp || isAuth ? "" : "pt-[7.5rem]"}`}>
      {children}
    </main>
  );
}
