import "./global.css";
import { createRoot } from "react-dom/client";

// Simple test component to verify React is working
const TestApp = () => {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        color: "black",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "blue", fontSize: "24px" }}>
        🚀 React App is Working!
      </h1>
      <p>This is a test to verify React is loading properly.</p>
      <button
        onClick={() => alert("React events are working!")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Test Button
      </button>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f0f8ff",
          border: "1px solid #007bff",
        }}
      >
        <strong>Debug Info:</strong>
        <ul>
          <li>React is mounting ✅</li>
          <li>JavaScript is executing ✅</li>
          <li>Styles are loading ✅</li>
          <li>Port 8080 is working ✅</li>
        </ul>
      </div>
    </div>
  );
};

// Mount the test app
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<TestApp />);
} else {
  console.error("Root element not found!");
}
