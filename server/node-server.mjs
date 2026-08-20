// Servidor Node de producción para el build de TanStack Start.
//
// `vite build` (con la config de Lovable) genera:
//   - dist/server/server.js  → handler web-standard `{ fetch(request) }` (SSR)
//   - dist/client/           → assets del cliente (JS/CSS con hash), favicon, robots
//
// Este entry sirve los estáticos de dist/client y delega todo lo demás al SSR.
// Arranca con:  node server/node-server.mjs   (o `npm start`)
// Puerto configurable con la variable de entorno PORT (default 3000).
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import handler from "../dist/server/server.js";

const app = new Hono();

// Estáticos del cliente (assets con hash, favicon.ico, robots.txt).
app.use("/*", serveStatic({ root: "./dist/client" }));

// Cualquier otra ruta la resuelve el render del servidor (SSR).
app.all("/*", (c) => handler.fetch(c.req.raw, {}, {}));

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Clinic Connect Pro escuchando en http://localhost:${info.port}`);
});
