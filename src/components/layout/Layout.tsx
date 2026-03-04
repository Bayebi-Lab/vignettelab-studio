import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Header />}
      <main className={`flex-1 ${isAdmin ? "pt-0" : "pt-16 lg:pt-20"}`}>
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}