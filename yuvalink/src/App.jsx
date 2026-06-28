import AppRoutes from "./routes/AppRoutes";
import Layout from "./layouts/Layout";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Layout>
      <AppRoutes />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--card-border)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600"
          }
        }}
      />
    </Layout>
  );
}

export default App;
