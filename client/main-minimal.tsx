import "./global.css";
import { createRoot } from "react-dom/client";

// Minimal test component
const TestApp = () => (
  <div
    style={{
      padding: "40px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "Inter, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    }}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      }}
    >
      <h1>🚀 T-Shirt Inventory System</h1>
      <p>✅ React App is Working!</p>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => (window.location.href = "/customers")}
          style={{
            background: "#2196f3",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            margin: "5px",
          }}
        >
          Go to Customers
        </button>
        <button
          onClick={() => testAPI()}
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            margin: "5px",
          }}
        >
          Test API
        </button>
      </div>
      <div
        id="api-status"
        style={{ marginTop: "20px", minHeight: "30px" }}
      ></div>
    </div>
  </div>
);

// Test API function
const testAPI = async () => {
  const statusDiv = document.getElementById("api-status");
  if (statusDiv) {
    statusDiv.innerHTML = "⏳ Testing API...";

    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (data.success) {
        statusDiv.innerHTML = `✅ API Working! Found ${data.data?.length || 0} customers.`;
        statusDiv.style.color = "#10b981";
      } else {
        statusDiv.innerHTML = `⚠️ API Error: ${data.error || "Unknown"}`;
        statusDiv.style.color = "#f59e0b";
      }
    } catch (error: any) {
      statusDiv.innerHTML = `❌ API Failed: ${error.message}`;
      statusDiv.style.color = "#ef4444";
    }
  }
};

// Make testAPI global
(window as any).testAPI = testAPI;

// Mount the app
const rootElement = document.getElementById("root");
if (rootElement) {
  // Show immediate loading
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
      <p style="color: #64748b; font-size: 16px;">Starting T-Shirt Inventory...</p>
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
    root.render(<TestApp />);
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
        <h1>React Mount Error</h1>
        <p>Failed to start: ${error}</p>
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
}
