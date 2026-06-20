import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { client } from "@/client/client.gen";
import { queryClient } from "./lib/query-client";
import App from "./app/App.tsx";
import "./styles/index.css";

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  auth: () => localStorage.getItem("access_token") || undefined,
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
