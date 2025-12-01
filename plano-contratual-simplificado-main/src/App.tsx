import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AreasRequisitantes from "./pages/AreasRequisitantes";
import DFDs from "./pages/DFDs";
import NovoDFD from "./pages/NovoDFD";
import Consolidacao from "./pages/Consolidacao";
import FormacaoPCA from "./pages/FormacaoPCA";
import AprovacaoPCA from "./pages/AprovacaoPCA";
import CatalogoItens from "./pages/CatalogoItens";
import Cadastros from "./pages/Cadastros";
import AgentesPublicos from "./pages/AgentesPublicos";
import UnidadesGestoras from "./pages/UnidadesGestoras";
import Orcamento from "./pages/Orcamento";
import Cargos from "./pages/Cargos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/areas-requisitantes" element={<AreasRequisitantes />} />
          <Route path="/catalogo-itens" element={<CatalogoItens />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/cadastros/agentes-publicos" element={<AgentesPublicos />} />
          <Route path="/cadastros/unidades-gestoras" element={<UnidadesGestoras />} />
          <Route path="/cadastros/cargos" element={<Cargos />} />
          <Route path="/cadastros/orcamento" element={<Orcamento />} />
          <Route path="/dfds" element={<DFDs />} />
          <Route path="/dfds/novo" element={<NovoDFD />} />
          <Route path="/consolidacao" element={<Consolidacao />} />
          <Route path="/formacao-pca" element={<FormacaoPCA />} />
          <Route path="/aprovacao-pca" element={<AprovacaoPCA />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
