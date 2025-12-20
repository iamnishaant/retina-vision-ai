import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
import Index from "./pages/Index";
import AboutDR from "./pages/AboutDR";
import EyeAnatomy from "./pages/EyeAnatomy";
import Results from "./pages/Results";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import ProjectInfo from "./pages/ProjectInfo";
import ProjectOverview from "./pages/ProjectOverview";
import ProjectDatasets from "./pages/ProjectDatasets";
import Preprocessing from "./pages/Preprocessing";
import Group1 from "./pages/Group1";
import Group2 from "./pages/Group2";
import Group3 from "./pages/Group3";
import Group4 from "./pages/Group4";
import Group5 from "./pages/Group5";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      {
        /* Use createBrowserRouter + RouterProvider so we can opt into v7 future flags
           and silence the React Router future warnings. */
      }
      {
        /* Build router with future flags passed into createBrowserRouter */
      }
      {(() => {
        const router = createBrowserRouter(
          createRoutesFromElements(
            <>
              <Route path="/" element={<Index />} />
              <Route path="/about-dr" element={<AboutDR />} />
              <Route path="/eye-anatomy" element={<EyeAnatomy />} />
              <Route path="/results" element={<Results />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/preprocessing" element={<Preprocessing />} />
              <Route path="/group-1" element={<Group1 />} />
              <Route path="/group-2" element={<Group2 />} />
              <Route path="/group-3" element={<Group3 />} />
              <Route path="/group-4" element={<Group4 />} />
              <Route path="/group-5" element={<Group5 />} />
              <Route path="/project-info" element={<ProjectOverview />} />
              <Route path="/project-overview" element={<ProjectOverview />} />
              <Route path="/project-datasets" element={<ProjectDatasets />} />
              <Route path="*" element={<NotFound />} />
            </>
          ),
          { future: { v7_relativeSplatPath: true, v7_startTransition: true } }
        );
        return <RouterProvider router={router} />;
      })()}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
