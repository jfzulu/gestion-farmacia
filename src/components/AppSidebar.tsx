
import { Calendar, FileText, Database, Clipboard, Home, Users, User, Sun, Moon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  const menuItems = [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
    },
    {
      title: "Inventario",
      url: "/inventario",
      icon: Database,
    },
    {
      title: "Ventas",
      url: "/ventas",
      icon: Clipboard,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Proveedores",
      url: "/proveedores",
      icon: User,
    },
    {
      title: "Informes",
      url: "/informes",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-4">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">FarmaGestión</span>
          </div>
          <div className="text-xs text-muted-foreground">Sistema de Droguería</div>
        </div>
        <SidebarTrigger className="ml-auto h-8 w-8" />
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url} className="w-full">
                <SidebarMenuButton 
                  isActive={location.pathname === item.url}
                  className={`w-full p-3 ${location.pathname === item.url ? "bg-primary/10 text-primary" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FarmaGestión
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
