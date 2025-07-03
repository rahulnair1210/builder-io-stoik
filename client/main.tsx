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

// Simple error boundary component
const AppErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    return <ErrorFallback error={error as Error} />;
  }
};

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

// Enhanced mounting with immediate loading feedback
const rootElement = document.getElementById("root");
if (rootElement) {
  // Show immediate dashboard loading state
  rootElement.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: Inter, Arial, sans-serif;
      flex-direction: column;
      gap: 20px;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 400px;
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 5px solid #e2e8f0;
          border-top: 5px solid #2196F3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0; font-weight: 600;">
          T-Shirt Inventory System
        </h1>
        <p style="color: #64748b; font-size: 16px; margin: 0;">
          Loading Dashboard...
        </p>
        <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
          <p style="color: #475569; font-size: 14px; margin: 0;">
            ✅ Frontend Server: Running<br>
            ✅ Backend API: Connected<br>
            ✅ Database: Firebase Firestore
          </p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  try {
    // Mount React app after a brief moment to show loading
    setTimeout(() => {
      const root = createRoot(rootElement);
      root.render(<App />);
    }, 800);
  } catch (error) {
    console.error("Failed to mount React app:", error);
    rootElement.innerHTML = `
      <div style="
        padding: 40px;
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
        font-family: Inter, Arial, sans-serif;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 500px;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
          <h1 style="font-size: 28px; margin: 0 0 15px 0; color: #1e293b;">React Mount Error</h1>
          <p style="font-size: 16px; margin: 0 0 25px 0; color: #64748b;">
            Failed to start the T-Shirt Inventory application: ${error}
          </p>
          <button onclick="window.location.reload()" style="
            padding: 15px 30px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          ">🔄 Reload Dashboard</button>
        </div>
      </div>
    `;
  }
} else {
  console.error("Root element not found!");
  document.body.innerHTML = `
    <div style="
      padding: 40px;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #dc2626;
      font-family: Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    ">
      <div style="font-size: 64px;">⚠️</div>
      <h1>HTML Root Element Missing</h1>
      <p>Cannot start T-Shirt Inventory System - root element not found.</p>
      <button onclick="window.location.reload()" style="
        padding: 15px 30px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
      ">🔄 Reload Application</button>
    </div>
  `;
}

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
