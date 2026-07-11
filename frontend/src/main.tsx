import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { App } from "./App";
import { cognitoAuthConfig } from "./auth/authConfig";
import { PrefsProvider } from "./prefs/PrefsContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <QueryClientProvider client={queryClient}>
        <PrefsProvider>
          <App />
        </PrefsProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
