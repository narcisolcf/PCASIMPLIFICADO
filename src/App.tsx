import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { MainLayout } from "./components/MainLayout";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AreasRequisitantes = lazy(() => import("./pages/AreasRequisitantes"));
const DFDs = lazy(() => import("./pages/DFDs"));
const NovoDFD = lazy(() => import("./pages/NovoDFD"));
const Consolidacao = lazy(() => import("./pages/Consolidacao"));
const FormacaoPCA = lazy(() => import("./pages/FormacaoPCA"));
const AprovacaoPCA = lazy(() => import("./pages/AprovacaoPCA"));
const CatalogoItens = lazy(() => import("./pages/CatalogoItens"));
const Cadastros = lazy(() => import("./pages/Cadastros"));
const AgentesPublicos = lazy(() => import("./pages/AgentesPublicos"));
const UnidadesGestoras = lazy(() => import("./pages/UnidadesGestoras"));
const Orcamento = lazy(() => import("./pages/Orcamento"));
const Cargos = lazy(() => import("./pages/Cargos"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />

              {/* Cadastros Routes */}
              <Route path="/cadastros" element={<Cadastros />} />
              <Route path="/cadastros/agentes-publicos" element={<AgentesPublicos />} />
              <Route path="/cadastros/unidades-gestoras" element={<UnidadesGestoras />} />
              <Route path="/cadastros/cargos" element={<Cargos />} />
              <Route path="/cadastros/orcamento" element={<Orcamento />} />

              {/* Modules */}
              <Route path="/areas-requisitantes" element={<AreasRequisitantes />} />
              <Route path="/catalogo-itens" element={<CatalogoItens />} />

              {/* DFDs Routes */}
              <Route path="/dfds" element={<DFDs />} />
              <Route path="/dfds/novo" element={<NovoDFD />} />
              <Route path="/dfds/:id" element={<NovoDFD />} />

              <Route path="/consolidacao" element={<Consolidacao />} />
              <Route path="/formacao-pca" element={<FormacaoPCA />} />
              <Route path="/aprovacao-pca" element={<AprovacaoPCA />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
