import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext";
import { Suspense, lazy, ErrorBoundary } from "react";

// Import pages directly for better reliability
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Enhanced loading component
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
      gap: "20px",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #e2e8f0",
        borderTop: "5px solid #2196F3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <h2 style={{ color: "#1e293b", fontSize: "24px", margin: "0" }}>
      T-Shirt Inventory System
    </h2>
    <p style={{ color: "#64748b", fontSize: "16px", margin: "0" }}>
      Loading Dashboard...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Enhanced error boundary component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError?: () => void;
}) => (
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
    <div style={{ fontSize: "64px" }}>⚠️</div>
    <h1 style={{ fontSize: "28px", margin: "0", color: "#1e293b" }}>
      T-Shirt Inventory System Error
    </h1>
    <p
      style={{
        margin: "0",
        textAlign: "center",
        maxWidth: "600px",
        fontSize: "18px",
      }}
    >
      Something went wrong while loading the dashboard: {error.message}
    </p>
    <div style={{ display: "flex", gap: "15px" }}>
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          padding: "12px 24px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Go to Dashboard
      </button>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "12px 24px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        Reload App
      </button>
    </div>
  </div>
);

// Simple error boundary class component
class AppErrorBoundary extends ErrorBoundary {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={new Error("Application failed to load")} />;
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <AppErrorBoundary>
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
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
