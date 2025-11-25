import React from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="bg-purple-brand w-full h-screen flex flex-col overflow-hidden">
          <SidebarTrigger className="text-white hover:bg-purple-brand-f size-10 m-4" />
          <div className="flex-1 overflow-hidden px-4 pb-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Layout;
