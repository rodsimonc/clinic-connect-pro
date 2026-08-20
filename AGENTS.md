<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

Convenciones **comunes a cualquier agente de IA** que asista en este repositorio
(Claude Code, Cursor, Copilot, Lovable, etc.). Si un agente tiene archivo propio
(`CLAUDE.md`, `.cursorrules`), ese archivo **extiende** —no contradice— lo que
acá se declara.

## Contexto del proyecto

App web de una clínica (sitio + reserva de turnos). Stack: TanStack Start
(React 19 + SSR) · TypeScript · Vite · Tailwind v4 + shadcn/ui · Supabase.
Package manager: **Bun**. Ver [`CLAUDE.md`](./CLAUDE.md) y [`specs.md`](./specs.md).

## Alcance autorizado

El agente **puede** modificar sin preguntar:

- Archivos bajo `src/` (excepto `src/routeTree.gen.ts`, que es autogenerado).
- Documentación (`*.md`, `docs/`).
- Configuración de formato/lint que no afecte infraestructura.

El agente **debe pedir confirmación** antes de:

- Modificar `.env*`, secretos, credenciales o claves.
- Cambiar el esquema de base de datos o migraciones (`supabase/migrations/`).
- Modificar pipelines CI/CD (`.github/`).
- Tocar `vite.config.ts` o la config de Lovable (`@lovable.dev/vite-tanstack-config`).
- Eliminar archivos versionados que no haya creado en la sesión actual.

## Estilo de commits

- Conventional Commits en español: `feat:`, `fix:`, `chore:`, `docs:`,
  `refactor:`, `style:`, `test:`.
- Un commit por cambio lógico — no agrupar por conveniencia.
- No reescribir historia ya pusheada (rompe el sync con Lovable).

## Verificación obligatoria

Antes de proponer un PR o cerrar una tarea:

1. **Build limpio** — `bun run build` sin errores.
2. **Lint/formato** — `bun run lint` y `bun run format` aplicados, sin warnings nuevos.
3. **Sin secretos** — revisá el diff contra patrones de API keys/tokens; `.env` nunca se commitea.
4. **Tests** — si existen, deben pasar (incluidos los nuevos).

## Salidas esperadas del agente

- **Plan antes de editar**: si el cambio afecta 3+ archivos, resumí el plan primero.
- **Diff legible**: cambios chicos y localizados, sin reformateo masivo mezclado con lógica.
- **Post-condición verificable**: indicá cómo saber que el cambio funciona (comando, ruta, test).

## Convenciones técnicas específicas

- **Ruteo:** file-based en `src/routes/`. No crear `src/pages/` ni `app/layout.tsx`
  (son de Next.js/Remix). No editar `routeTree.gen.ts` a mano. Ver `src/routes/README.md`.
- **Imports:** usar el alias `@/` (mapeado a `src/`), no rutas relativas largas.
- **Datos:** fetching vía TanStack Query (`src/lib/queries.ts`); tipos de dominio en `src/lib/clinic.ts`.
- **Servidor:** módulos server-only con sufijo `*.server.ts` (no usar `server-only` de Next).
- **UI:** componentes de `src/components/ui/` (shadcn); estilos con tokens de Tailwind, ver [`DESIGN.md`](./DESIGN.md).
- **Idioma:** UI y comentarios en español; identificadores en inglés donde tenga sentido, dominio en español (`turno`, `medico`, `especialidad`).

## Errores comunes a evitar

- Crear documentación paralela que se desactualiza (README dentro de cada subcarpeta).
- Introducir dependencias nuevas sin evaluación ni justificación.
- Refactors "de paso" que no pertenecen al cambio solicitado.
- Duplicar componentes de `ui/` en vez de reutilizarlos.
