import "./global.css";
import { createRoot } from "react-dom/client";

// Simple Dashboard Component
const Dashboard = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "20px",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              margin: "0",
              fontSize: "24px",
              color: "#1e293b",
              fontWeight: "600",
            }}
          >
            🧑‍🏭 T-Shirt Inventory System
          </h1>
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              style={{
                background: "#2196F3",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => (window.location.href = "/inventory")}
              style={{
                background: "#e2e8f0",
                color: "#64748b",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Inventory
            </button>
            <button
              onClick={() => (window.location.href = "/orders")}
              style={{
                background: "#e2e8f0",
                color: "#64748b",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Orders
            </button>
            <button
              onClick={() => (window.location.href = "/customers")}
              style={{
                background: "#e2e8f0",
                color: "#64748b",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Customers
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Welcome Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)",
            color: "white",
            padding: "40px",
            borderRadius: "15px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 15px 0", fontSize: "32px" }}>
            Welcome to Your T-Shirt Inventory
          </h2>
          <p style={{ margin: "0", fontSize: "18px", opacity: "0.9" }}>
            ✅ Frontend is now loading successfully!
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
              📦 Total Products
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "28px",
                fontWeight: "600",
                color: "#2196F3",
              }}
            >
              Loading...
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
              🛒 Orders
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "28px",
                fontWeight: "600",
                color: "#4CAF50",
              }}
            >
              Loading...
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
              👥 Customers
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "28px",
                fontWeight: "600",
                color: "#FF9800",
              }}
            >
              Loading...
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
              💰 Revenue
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "28px",
                fontWeight: "600",
                color: "#9C27B0",
              }}
            >
              Loading...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b" }}>
            Quick Actions
          </h3>
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => testAPI()}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "15px 25px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              🔗 Test API Connection
            </button>

            <button
              onClick={() => (window.location.href = "/inventory")}
              style={{
                background: "#2196F3",
                color: "white",
                border: "none",
                padding: "15px 25px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              📦 Manage Inventory
            </button>

            <button
              onClick={() => (window.location.href = "/customers")}
              style={{
                background: "#FF9800",
                color: "white",
                border: "none",
                padding: "15px 25px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              👥 View Customers
            </button>
          </div>

          <div
            id="api-status"
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f1f5f9",
              borderRadius: "8px",
              minHeight: "20px",
            }}
          >
            Click "Test API Connection" to verify backend connectivity
          </div>
        </div>
      </div>
    </div>
  );
};

// Test API function
const testAPI = async () => {
  const statusDiv = document.getElementById("api-status");
  if (statusDiv) {
    statusDiv.innerHTML = "⏳ Testing API connection...";
    statusDiv.style.background = "#fff3cd";

    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (data.success) {
        statusDiv.innerHTML = `✅ API Working! Found ${data.data?.length || 0} customers in database.`;
        statusDiv.style.background = "#d1ecf1";
        statusDiv.style.color = "#0c5460";
      } else {
        statusDiv.innerHTML = `⚠️ API Error: ${data.error || "Unknown error"}`;
        statusDiv.style.background = "#fff3cd";
        statusDiv.style.color = "#856404";
      }
    } catch (error: any) {
      statusDiv.innerHTML = `❌ API Connection Failed: ${error.message}`;
      statusDiv.style.background = "#f8d7da";
      statusDiv.style.color = "#721c24";
    }
  }
};

// Make testAPI global
(window as any).testAPI = testAPI;

// Simple Router Component
const SimpleRouter = () => {
  const path = window.location.pathname;

  if (path === "/" || path === "/dashboard") {
    return <Dashboard />;
  }

  // Fallback for other routes
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, Arial, sans-serif",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h1
          style={{ color: "#1e293b", fontSize: "24px", margin: "0 0 15px 0" }}
        >
          🔧 Page Under Development
        </h1>
        <p style={{ color: "#64748b", margin: "0 0 25px 0" }}>
          The {path} page is being built. For now, use the dashboard.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          🏠 Go to Dashboard
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => <SimpleRouter />;

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
          🧑‍🏭 T-Shirt Inventory System
        </h1>
        <p style="color: #64748b; font-size: 16px; margin: 0;">
          Starting Dashboard...
        </p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;

  // Mount React after showing loading
  setTimeout(() => {
    try {
      const root = createRoot(rootElement);
      root.render(<App />);
    } catch (error) {
      console.error("Failed to mount React app:", error);
      rootElement.innerHTML = `
        <div style="
          padding: 40px; 
          background: #fee2e2; 
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
          <h1>React Mount Failed</h1>
          <p>Error: ${error}</p>
          <button onclick="window.location.reload()" style="
            padding: 15px 30px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
          ">Reload</button>
        </div>
      `;
    }
  }, 500);
} else {
  console.error("Root element not found!");
}
