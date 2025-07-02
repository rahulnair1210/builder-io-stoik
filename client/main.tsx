import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext";

// Import pages with error boundaries
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div
    style={{
      padding: "20px",
      backgroundColor: "white",
      color: "red",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <h1>⚠️ App Error</h1>
    <p>Something went wrong: {error.message}</p>
    <button onClick={() => window.location.reload()}>Reload App</button>
  </div>
);

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    return <ErrorFallback error={error as Error} />;
  }
};

// Mount the app with error handling
const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Failed to mount React app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; background: white; color: red; font-family: Arial;">
        <h1>❌ React Mount Error</h1>
        <p>Failed to start the app: ${error}</p>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `;
  }
} else {
  console.error("Root element not found!");
}
