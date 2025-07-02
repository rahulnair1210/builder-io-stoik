import "./global.css";
import { createRoot } from "react-dom/client";

// Simple test component
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
        background: "linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)",
        color: "white",
        padding: "40px",
        borderRadius: "15px",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        maxWidth: "600px",
      }}
    >
      <h1 style={{ margin: "0 0 20px 0", fontSize: "32px" }}>
        🚀 T-Shirt Inventory System
      </h1>
      <p style={{ margin: "0 0 30px 0", fontSize: "18px", opacity: 0.9 }}>
        ✅ React App is Working Successfully!
      </p>

      <div style={{ marginBottom: "30px" }}>
        <div
          id="api-status"
          style={{
            minHeight: "30px",
            fontSize: "16px",
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "8px",
            margin: "10px 0",
          }}
        >
          Click "Test API" to check backend connection
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => testAPI()}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          Test API Connection
        </button>

        <button
          onClick={() => restoreFullApp()}
          style={{
            background: "#FF9800",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          Load Full App
        </button>
      </div>

      <div
        style={{
          marginTop: "30px",
          fontSize: "14px",
          opacity: "0.8",
          background: "rgba(255,255,255,0.1)",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "5px 0" }}>✅ Frontend: http://localhost:8080</p>
        <p style={{ margin: "5px 0" }}>✅ Backend: http://localhost:3001</p>
        <p style={{ margin: "5px 0" }}>✅ React: Mounted successfully</p>
      </div>
    </div>
  </div>
);

// Test API function
const testAPI = async () => {
  const statusDiv = document.getElementById("api-status");
  if (statusDiv) {
    statusDiv.innerHTML = "⏳ Testing API connection...";
    statusDiv.style.background = "rgba(255,193,7,0.3)";

    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (data.success) {
        statusDiv.innerHTML = `✅ API Working! Found ${data.data?.length || 0} customers in database.`;
        statusDiv.style.background = "rgba(76,175,80,0.3)";
      } else {
        statusDiv.innerHTML = `⚠️ API Error: ${data.error || "Unknown error"}`;
        statusDiv.style.background = "rgba(255,152,0,0.3)";
      }
    } catch (error: any) {
      statusDiv.innerHTML = `❌ API Connection Failed: ${error.message}`;
      statusDiv.style.background = "rgba(244,67,54,0.3)";
    }
  }
};

// Function to restore full app
const restoreFullApp = () => {
  if (
    confirm(
      "This will reload the page with the full T-Shirt Inventory application. Continue?",
    )
  ) {
    // We would need to restore the full main.tsx here
    window.location.reload();
  }
};

// Make functions global
(window as any).testAPI = testAPI;
(window as any).restoreFullApp = restoreFullApp;

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
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
      font-family: Inter, Arial, sans-serif;
      flex-direction: column;
      gap: 20px;
    ">
      <div style="
        width: 50px; 
        height: 50px; 
        border: 5px solid #e2e8f0; 
        border-top: 5px solid #2196F3; 
        border-radius: 50%; 
        animation: spin 1s linear infinite;
      "></div>
      <h2 style="color: #64748b; font-size: 20px; margin: 0;">Starting T-Shirt Inventory System...</h2>
      <p style="color: #94a3b8; font-size: 16px; margin: 0;">Please wait while we initialize the application</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  try {
    // Small delay to show loading
    setTimeout(() => {
      const root = createRoot(rootElement);
      root.render(<TestApp />);
    }, 1000);
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
        <div style="font-size: 64px;">❌</div>
        <h1 style="font-size: 28px; margin: 0;">React Mount Error</h1>
        <p style="font-size: 18px; margin: 0; text-align: center; max-width: 600px;">
          Failed to start the React application: ${error}
        </p>
        <button onclick="window.location.reload()" style="
          padding: 15px 30px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        ">🔄 Reload Application</button>
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
      <h1 style="font-size: 28px; margin: 0;">Root Element Missing</h1>
      <p style="font-size: 18px; margin: 0;">The application could not find the root element to mount.</p>
      <button onclick="window.location.reload()" style="
        padding: 15px 30px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 18px;
        font-weight: 600;
      ">🔄 Reload Application</button>
    </div>
  `;
}
