import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import Informes from "./pages/Informes";
import { useLocalStorage } from "./hooks/use-local-storage";
import { SeedDatabase } from "./lib/seed-database";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [databaseInitialized, setDatabaseInitialized] = useLocalStorage("pharmacy-db-initialized", false);

  useEffect(() => {
    if (!databaseInitialized) {
      SeedDatabase();
      setDatabaseInitialized(true);
    }
    setIsInitialized(true);
  }, [databaseInitialized, setDatabaseInitialized]);

  if (!isInitialized) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="farmagestion-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/informes" element={<Informes />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
