import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load das páginas: cada página é baixada só quando o usuário a acessa.
// Isso reduz o tamanho do bundle inicial e acelera o carregamento da tela de login.
const AuthPage = lazy(() => import("./pages/AuthPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SeparadorPage = lazy(() => import("./pages/SeparadorPage"));
const MeusEmbarquesPage = lazy(() => import("./pages/MeusEmbarquesPage"));
const ConferentePage = lazy(() => import("./pages/ConferentePage"));
const LiderPage = lazy(() => import("./pages/LiderPage"));
const FiscalPage = lazy(() => import("./pages/FiscalPage"));
const SelecionarPerfilPage = lazy(() => import("./pages/SelecionarPerfilPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">
    Carregando...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<ProtectedRoute><LoginPage /></ProtectedRoute>} />
              <Route path="/selecionar-perfil" element={<ProtectedRoute><SelecionarPerfilPage /></ProtectedRoute>} />
              <Route path="/separador" element={<ProtectedRoute allowedRole="separador"><SeparadorPage /></ProtectedRoute>} />
              <Route path="/meus-embarques" element={<ProtectedRoute><MeusEmbarquesPage /></ProtectedRoute>} />
              <Route path="/conferente" element={<ProtectedRoute allowedRole="conferente"><ConferentePage /></ProtectedRoute>} />
              <Route path="/lider" element={<ProtectedRoute allowedRole="lider"><LiderPage /></ProtectedRoute>} />
              <Route path="/fiscal" element={<ProtectedRoute allowedRole="fiscal"><FiscalPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
