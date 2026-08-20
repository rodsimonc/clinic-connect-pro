# Clinic Connect Pro

**🔗 Demo en vivo:** https://clinic-connect-pro.onrender.com/

Aplicación web para una clínica: sitio institucional + reserva de turnos médicos
online. Los pacientes pueden ver especialidades y profesionales, reservar y
gestionar sus turnos; el panel de administración gestiona la operación.

Construido con **TanStack Start** (React 19 + SSR), **TypeScript**, **Vite**,
**Tailwind CSS v4** con componentes **shadcn/ui**, y **Supabase** (Postgres +
Auth) como backend. El proyecto se desarrolla de forma híbrida entre
[Lovable](https://lovable.dev) y edición local/agentes de IA.

## Stack

| Capa            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Framework       | TanStack Start (React 19, SSR con Nitro)    |
| Lenguaje        | TypeScript (modo `strict`)                  |
| Ruteo           | TanStack Router (file-based, `src/routes/`) |
| Datos (cliente) | TanStack Query                              |
| Estilos         | Tailwind CSS v4 + shadcn/ui (estilo new-york)|
| Backend         | Supabase (Postgres, Auth, RLS)              |
| Build tool      | Vite 8                                       |
| Package manager | Bun                                          |
| Lint / Formato  | ESLint + Prettier                           |

## Requisitos

- [Bun](https://bun.sh) ≥ 1.1 (o Node.js ≥ 20 con npm; el repo usa `bun.lock`).
- Un proyecto de [Supabase](https://supabase.com) con las tablas de la clínica.

## Puesta en marcha

```sh
git clone https://github.com/rodsimonc/clinic-connect-pro.git
cd clinic-connect-pro
bun install
cp .env.example .env   # completá tus credenciales de Supabase
bun run dev
```

La app queda disponible en `http://localhost:3000`.

## Scripts

| Comando            | Descripción                                  |
| ------------------ | -------------------------------------------- |
| `bun run dev`      | Servidor de desarrollo con HMR.              |
| `bun run build`    | Build de producción.                         |
| `bun run preview`  | Sirve el build de producción localmente.     |
| `bun run start`    | Sirve el build ya compilado (server Node).   |
| `bun run lint`     | ESLint sobre todo el proyecto.               |
| `bun run format`   | Prettier en modo corrección.                 |

## Docker (mostrar la app sin instalar nada)

Para levantar la app compilada con un solo comando, sin `npm install`/`npm run dev`:

```sh
cp .env.example .env   # completá tus credenciales de Supabase (si no lo hiciste)
docker compose up --build
```

Después abrí `http://localhost:3000`. Compose usa tu `.env` tanto para el build
(las variables `VITE_*` que Vite embebe en el cliente) como para el runtime del
servidor. Para pararlo: `docker compose down`.

El servidor de producción es `server/node-server.mjs`: sirve los estáticos de
`dist/client` y delega el resto al render del servidor (SSR) de TanStack Start.
También podés correrlo sin Docker con `bun run build && bun run start`.

## Deploy con link público (Render)

El repo incluye `render.yaml` (Render Blueprint) para publicar la app con una URL
para compartir:

1. Entrá a `https://dashboard.render.com` → **New → Blueprint**.
2. Conectá GitHub y elegí `rodsimonc/clinic-connect-pro`. Render lee `render.yaml`.
3. Cargá las variables de entorno que pide (las mismas de tu `.env`).
4. **Apply** → Render buildea con el `Dockerfile` y te da una URL
   `https://clinic-connect-pro.onrender.com`.

Render inyecta `PORT` automáticamente (el servidor la respeta) y pasa las
variables `VITE_*` como build args para que Vite las embeba en el cliente. En el
plan free el servicio se suspende tras un rato de inactividad y tarda unos
segundos en despertar en la primera visita.

## Estructura del proyecto

```
clinic-connect-pro/
├── src/
│   ├── routes/            # Rutas file-based (TanStack Router)
│   ├── components/
│   │   ├── ui/            # Componentes shadcn/ui
│   │   └── site/          # Header, Footer y layout del sitio
│   ├── integrations/
│   │   └── supabase/      # Cliente, auth y tipos generados
│   ├── lib/               # Dominio, queries y utilidades
│   ├── hooks/             # Hooks reutilizables
│   └── styles.css         # Design tokens (Tailwind v4 @theme)
├── supabase/
│   ├── config.toml
│   └── migrations/        # Migraciones SQL
├── AGENTS.md              # Convenciones para agentes de IA
├── CLAUDE.md              # Contexto para Claude Code
├── DESIGN.md             # Sistema de diseño y estándares de UI
└── specs.md              # Contrato de especificación del proyecto
```

## Documentación para agentes de IA

Este repo se trabaja con asistentes de IA. Antes de generar o modificar código,
leé [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md) y
[`DESIGN.md`](./DESIGN.md). El contrato del proyecto vive en
[`specs.md`](./specs.md) y el historial de cambios en
[`CHANGELOG.md`](./CHANGELOG.md).

## Lovable

Este proyecto está conectado a [Lovable](https://lovable.dev). Cada cambio
mergeado a `main` en GitHub se sincroniza de vuelta al editor de Lovable. Para no
perder el historial del proyecto, evitá reescribir historia ya publicada
(force-push, rebase o squash de commits ya pusheados).
