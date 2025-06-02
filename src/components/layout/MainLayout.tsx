
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import PopupModal from "../PopupModal";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <PopupModal />
    </div>
  );
};

export default MainLayout;
