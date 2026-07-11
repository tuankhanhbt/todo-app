import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Tailwind v4 nạp qua plugin Vite (không cần tailwind.config.js).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // khớp callback URL đã đăng ký trong Cognito
  },
});
