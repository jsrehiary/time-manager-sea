import React from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "./ui/input";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="bg-purple-brand w-full h-screen flex flex-col overflow-hidden">
          <div className="flex flex-row">
            <SidebarTrigger className="justify-self-start text-white hover:bg-purple-brand-f hover:text-white size-10 m-4" />
            <Input className="max-w-md my-4 flex-1 text-white rounded-2xl bg-white/5 placeholder:text-white" placeholder="Search..." />
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Layout;
