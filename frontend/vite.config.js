import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { cpSync } from "node:fs";
export default defineConfig({ plugins: [react(), { name: "copy-original-assets", closeBundle() {
  cpSync("assets", "dist/assets", { recursive: true });
} }], build: { rollupOptions: { input: Object.fromEntries(["index", "receitas", "receita", "login", "perfil", "sobre", "contato"].map((name) => [name, resolve(process.cwd(), name === "index" ? "index.html" : "pages/" + name + ".html")])) } } });
