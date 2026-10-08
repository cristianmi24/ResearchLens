// Empaqueta el backend en un único dist/index.js (con todas sus dependencias dentro).
// En Vercel el código compilado queda en la raíz de la función pero node_modules no,
// así que un dist/ con imports sueltos ("express", "pg"...) no encuentra los paquetes.
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  // pg lo intenta cargar de forma opcional; no está instalado.
  external: ["pg-native"],
  // Dependencias CommonJS (express, pg...) usan require() internamente.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "warning",
});

// Sin esto, Node trataría dist/index.js como CommonJS si no ve el package.json del server.
writeFileSync("dist/package.json", JSON.stringify({ type: "module" }));
