import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function reloadOnNodeChanges(): Plugin {
  return {
    name: "reload-on-node-changes",
    handleHotUpdate({ file, server }) {
      if (/[\\/]editor[\\/]nodes[\\/]/.test(file)) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), reloadOnNodeChanges()],
});
