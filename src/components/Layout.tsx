
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
