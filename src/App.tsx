import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ProjectDetail from "./pages/ProjectDetail";
import Submit from "./pages/Submit";
import SubmitProblem from "./pages/SubmitProblem";
import Problems from "./pages/Problems";
import GenerateProblem from "./pages/GenerateProblem";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import BulkImport from "./pages/BulkImport";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/submit-problem" element={<SubmitProblem />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/generate-problem" element={<GenerateProblem />} />
          <Route path="/community" element={<Community />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/bulk-import" element={<BulkImport />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
