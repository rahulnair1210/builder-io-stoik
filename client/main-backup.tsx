import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Orders = lazy(() => import("./pages/Orders"));
const Customers = lazy(() => import("./pages/Customers"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient();

// Loading component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily: "Inter, Arial, sans-serif",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #2196F3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <p style={{ color: "#64748b", fontSize: "16px" }}>
      Loading T-Shirt Inventory...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error boundary component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div
    style={{
      padding: "40px",
      backgroundColor: "#fff",
      color: "#ef4444",
      minHeight: "100vh",
      fontFamily: "Inter, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    }}
  >
    <div style={{ fontSize: "48px" }}>⚠️</div>
    <h1 style={{ fontSize: "24px", margin: "0", color: "#1e293b" }}>
      App Error
    </h1>
    <p style={{ margin: "0", textAlign: "center", maxWidth: "600px" }}>
      Something went wrong: {error.message}
    </p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: "12px 24px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      Reload App
    </button>
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
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    return <ErrorFallback error={error as Error} />;
  }
};

// Show initial loading state immediately
const rootElement = document.getElementById("root");
if (rootElement) {
  // Show loading state immediately
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      background-color: #f8fafc; 
      font-family: Inter, Arial, sans-serif;
      flex-direction: column;
      gap: 16px;
    ">
      <div style="
        width: 40px; 
        height: 40px; 
        border: 4px solid #e2e8f0; 
        border-top: 4px solid #2196F3; 
        border-radius: 50%; 
        animation: spin 1s linear infinite;
      "></div>
      <p style="color: #64748b; font-size: 16px;">Loading T-Shirt Inventory...</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Failed to mount React app:", error);
    rootElement.innerHTML = `
      <div style="
        padding: 40px; 
        background: white; 
        color: #ef4444; 
        font-family: Inter, Arial, sans-serif;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
      ">
        <div style="font-size: 48px;">❌</div>
        <h1 style="font-size: 24px; margin: 0; color: #1e293b;">React Mount Error</h1>
        <p style="margin: 0; text-align: center; max-width: 600px;">
          Failed to start the app: ${error}
        </p>
        <button onclick="window.location.reload()" style="
          padding: 12px 24px;
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        ">Reload</button>
      </div>
    `;
  }
} else {
  console.error("Root element not found!");
  document.body.innerHTML = `
    <div style="
      padding: 40px; 
      background: white; 
      color: #ef4444; 
      font-family: Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    ">
      <div style="font-size: 48px;">❌</div>
      <h1>Root Element Not Found</h1>
      <p>The application could not find the root element to mount.</p>
      <button onclick="window.location.reload()" style="
        padding: 12px 24px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      ">Reload</button>
    </div>
  `;
}
