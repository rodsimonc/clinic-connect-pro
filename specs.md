# specs.md — Clinic Connect Pro

> **Contrato** del proyecto. Documenta las decisiones ya tomadas sobre stack,
> estructura y convenciones. Se reconstruyó a partir del estado real del repo
> (proyecto generado con Lovable) para dar un punto de partida formal.

**Fecha:** 2026-08-20
**Responsable:** @rodsimonc
**Versión del contrato:** 0.1.0

---

## 1. Objetivo del proyecto

Aplicación web para una clínica que combina un sitio institucional con la reserva
y gestión de turnos médicos online. Los pacientes ven especialidades y
profesionales, reservan turnos y consultan los suyos; el staff administra la
operación desde un panel. Público: pacientes (self-service, mobile-first) y
personal de la clínica.

## 2. Stack

| Capa            | Tecnología           | Versión  | Justificación breve                       |
| --------------- | -------------------- | -------- | ----------------------------------------- |
| Runtime         | Node/Bun             | Bun ≥1.1 | Package manager y runtime rápido          |
| Lenguaje        | TypeScript           | ^5.8     | Tipado estricto, seguridad en refactors   |
| Framework       | TanStack Start (React 19) | ^1.168 | SSR + file-based routing                 |
| Ruteo           | TanStack Router      | 1.170    | Rutas tipadas file-based                  |
| Estado/datos    | TanStack Query       | ^5.101   | Cache y fetching declarativo              |
| Estilos         | Tailwind CSS v4 + shadcn/ui | ^4.2 | Design tokens + componentes accesibles   |
| Persistencia    | Supabase (Postgres)  | ^2.112   | BD + Auth gestionados, RLS                |
| Auth            | Supabase Auth        | —        | Integrado con la BD                       |
| Package manager | Bun                  | ≥1.1     | `bun.lock` versionado                     |

## 3. Estructura de carpetas

```
clinic-connect-pro/
├── src/
│   ├── routes/            # Rutas file-based (index, turnos, medicos, especialidades, admin, auth, mis-turnos, contacto)
│   ├── components/
│   │   ├── ui/            # shadcn/ui
│   │   └── site/          # Header, Footer
│   ├── integrations/supabase/   # Cliente, auth, tipos
│   ├── lib/               # Dominio (clinic.ts), queries, utils
│   ├── hooks/             # useAuth, use-mobile
│   └── styles.css         # Design tokens
├── supabase/
│   ├── config.toml
│   └── migrations/
├── AGENTS.md · CLAUDE.md · DESIGN.md · specs.md · CHANGELOG.md
└── .github/workflows/ci.yml
```

## 4. Convenciones

- **Naming de archivos:** rutas en kebab/lowercase (`mis-turnos.tsx`); componentes en PascalCase.
- **Exports:** mixto — componentes con named export; rutas con `createFileRoute`.
- **Imports:** alias `@/` → `src/` (sin rutas relativas largas).
- **Server-only:** sufijo `*.server.ts` (no el paquete `server-only`).
- **Commits:** Conventional Commits en español (`feat`, `fix`, `chore`, `docs`, `refactor`).
- **Tests:** aún no configurados (ver fuera de alcance).

## 5. Scripts acordados

```
dev      - bun run dev      → desarrollo local (HMR).
build    - bun run build    → artefacto productivo.
preview  - bun run preview  → sirve el build.
lint     - bun run lint     → ESLint (verificación).
format   - bun run format   → Prettier (corrección).
```

## 6. Decisiones cerradas

- **Monorepo o repo único?** Repo único.
- **Lint/Formato?** ESLint + Prettier (config en `eslint.config.js`, `.prettierrc`).
- **CI/CD?** GitHub Actions (`.github/workflows/ci.yml`): lint + build.
- **BaaS?** Supabase (Postgres + Auth + RLS); migraciones en `supabase/migrations/`.
- **Secretos?** `.env` en `.gitignore`; plantilla en `.env.example`.
- **Sincronización?** Lovable ↔ GitHub (branch `main`); no reescribir historia publicada.

## 7. Fuera de alcance (v0)

- Suite de tests automatizados (Vitest) — pendiente de agregar.
- i18n (la app es solo español).
- Pagos online / integración con obras sociales.

## 8. Historial del contrato

- **0.1.0 (2026-08-20):** primera versión formal, reconstruida desde el estado
  real del repo generado con Lovable.
