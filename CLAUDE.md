# CLAUDE.md

Contexto para Claude Code (y agentes compatibles) al trabajar en este repo.
Mantener **corto, específico y verificable**. Extiende [`AGENTS.md`](./AGENTS.md).

## Resumen del proyecto

App web de una clínica: sitio institucional + reserva y gestión de turnos
médicos online, con panel de administración. Stack TanStack Start (React 19 +
SSR) + TypeScript + Supabase. Pensada para pacientes (reserva self-service) y
staff de la clínica (administración).

## Comandos frecuentes

```bash
# Instalar dependencias
bun install

# Levantar en desarrollo (http://localhost:3000)
bun run dev

# Build de producción
bun run build

# Lint y formato
bun run lint
bun run format
```

## Arquitectura en una pantalla

- **Rendering:** TanStack Start con SSR (entry en `src/server.ts`, Nitro en build).
- **Ruteo:** file-based en `src/routes/` (`__root.tsx` es el shell). `routeTree.gen.ts` es autogenerado.
- **Datos:** TanStack Query → helpers en `src/lib/queries.ts` → Supabase (`src/integrations/supabase/`).
- **Auth:** Supabase Auth vía `src/hooks/useAuth.tsx` y middleware en `src/integrations/supabase/`.
- **Dominio:** tipos y constantes en `src/lib/clinic.ts` (`Turno`, `Medico`, `Especialidad`, `EstadoTurno`...).
- **UI:** shadcn/ui en `src/components/ui/`; layout del sitio en `src/components/site/`.

## Convenciones de código

- Idioma: UI y comentarios en español; dominio en español (`turno`, `medico`).
- Imports con alias `@/` (no rutas relativas largas).
- Módulos server-only con sufijo `*.server.ts` (no el paquete `server-only` de Next).
- TypeScript en modo `strict`: respetar `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.
- Estilos con tokens de Tailwind v4 definidos en `src/styles.css` (ver [`DESIGN.md`](./DESIGN.md)); no hardcodear colores hex.

## Qué evitar

- No editar `src/routeTree.gen.ts` a mano (se regenera).
- No crear `src/pages/` ni convenciones de Next.js/Remix.
- No meter lógica de acceso a datos dispersa en componentes: centralizar en `src/lib/`.
- No commitear `.env` ni claves (usar `.env.example`).
- No agregar librerías de componentes nuevas sin discutirlo.

## Referencias cruzadas

- [AGENTS.md](./AGENTS.md) — convenciones multi-agente.
- [DESIGN.md](./DESIGN.md) — sistema de diseño y estándares de UI.
- [specs.md](./specs.md) — contrato de especificación del proyecto.
- `src/routes/README.md` — reglas del ruteo file-based.
