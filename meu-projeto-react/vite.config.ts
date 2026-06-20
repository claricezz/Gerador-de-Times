import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    plugins: [
        TanStackRouterVite(),
        react(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        middlewareMode: true,
    },
    ssr: {
        external: ["react", "react-dom"],
        noExternal: ["@tanstack/react-router", "@tanstack/react-query"],
    },
});