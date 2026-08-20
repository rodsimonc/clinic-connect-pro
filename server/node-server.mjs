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

// Render espera el puerto 10000 por defecto; se respeta process.env.PORT si viene.
const port = Number(process.env.PORT ?? 10000);

const server = serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Clinic Connect Pro escuchando en http://0.0.0.0:${info.port}`);
});

// Timeouts holgados para evitar 502 por "connection reset" detrás del proxy de Render.
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
