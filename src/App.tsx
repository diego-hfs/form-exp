import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import LoginPage from "./pages/LoginPage";
import SeparadorPage from "./pages/SeparadorPage";
import MeusEmbarquesPage from "./pages/MeusEmbarquesPage";
import ConferentePage from "./pages/ConferentePage";
import FiscalPage from "./pages/FiscalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><LoginPage /></ProtectedRoute>} />
            <Route path="/separador" element={<ProtectedRoute allowedRole="separador"><SeparadorPage /></ProtectedRoute>} />
            <Route path="/meus-embarques" element={<ProtectedRoute allowedRole="separador"><MeusEmbarquesPage /></ProtectedRoute>} />
            <Route path="/conferente" element={<ProtectedRoute allowedRole="conferente"><ConferentePage /></ProtectedRoute>} />
            <Route path="/fiscal" element={<ProtectedRoute allowedRole="fiscal"><FiscalPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
