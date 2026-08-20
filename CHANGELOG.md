# Changelog

Todos los cambios notables de este proyecto se documentan acá.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado] — 2026-08-20

Adecuación del repositorio a la estructura de referencia del bootcamp
(`Bootcamp-main/examples-md`) y a buenas prácticas. Cambios de documentación,
configuración e higiene; **no se modificó lógica de la aplicación** para no
alterar el sync con Lovable.

### Added

- `CLAUDE.md` — contexto para Claude Code adaptado al stack real (TanStack Start + Supabase).
- `DESIGN.md` — sistema de diseño y estándares de UI, referenciando los tokens de `src/styles.css`.
- `specs.md` — contrato de especificación del proyecto (stack, estructura, convenciones, decisiones).
- `.env.example` — plantilla de variables de entorno con valores placeholder.
- `.github/workflows/ci.yml` — CI en GitHub Actions (lint + build con Bun).
- `CHANGELOG.md` — este archivo, como registro de cambios.

### Changed

- `AGENTS.md` — se conservó el bloque de Lovable y se completó con las
  convenciones del bootcamp adaptadas al stack (alcance autorizado, estilo de
  commits, verificación con `bun run lint`/`build`, convenciones técnicas).
- `README.md` — reescrito: se eliminó una línea de prompt pegada por error
  ("Tenés acceso a mí github…") y se documentó objetivo, stack, setup, scripts y estructura.
- `.gitignore` — se agregó `.env` y variantes para evitar subir secretos.

### Added (deploy con link público)

- `render.yaml` (Render Blueprint): despliega la app vía Docker en Render y
  entrega una URL pública `*.onrender.com` para compartir la demo. Declara las
  variables de entorno (Supabase) que se cargan al crear el servicio. Render
  inyecta `PORT` y pasa las `VITE_*` como build args.

### Added (deploy / Docker)

- **Servidor de producción** `server/node-server.mjs` (Hono + `@hono/node-server`):
  sirve `dist/client` y delega el resto al SSR de TanStack Start. Script `npm start`.
- **Docker**: `Dockerfile` multi-stage (build con `node:22` + npm público, runtime
  `node:22-slim` con deps de producción) y `docker-compose.yml`. Levantar con
  `docker compose up --build` → `http://localhost:3000`, sin `npm install` manual.
  Las variables `VITE_*` se pasan como build args desde `.env`; el runtime usa `env_file`.
- `.dockerignore` para no meter `node_modules`, `dist`, `.git` ni secretos en la imagen.
- Dependencias nuevas: `hono` y `@hono/node-server` (sólo para el servidor de prod).
- Verificado localmente: build (`vite build`) + arranque del servidor sirviendo
  `/`, `/medicos`, `/turnos` (200, SSR) y assets JS/CSS/favicon; 404 para rutas inexistentes.

### Fixed

- **Flujo de reserva de turnos:** al elegir un profesional (o especialidad) en
  las páginas de Médicos, Especialidades y Home, el link "Reservar" iba a
  `/turnos` **sin arrastrar la selección**, así que la reserva empezaba vacía.
  Ahora:
  - `/turnos` acepta search params `?medico` y `?especialidad` (vía `validateSearch`)
    e inicializa el formulario con esa selección; deriva la especialidad del
    profesional elegido y descarta ids inválidos.
  - Los links de `medicos.tsx` pasan `{ medico, especialidad }`; los de
    `especialidades.tsx` e `index.tsx` pasan `{ especialidad }`.
- **Volver a la reserva después de ingresar:** si un usuario no logueado tocaba
  "Ingresar y confirmar", tras loguearse caía siempre en `/mis-turnos` y perdía
  la reserva. Ahora `/auth` recibe la selección (`?medico`/`?especialidad`) y
  devuelve al usuario a `/turnos` con el profesional ya elegido.
- **"Mis turnos" mostraba turnos ajenos a cuentas staff:** la consulta no
  filtraba por paciente y dependía sólo de RLS (que para staff devuelve todos).
  Se agregó `.eq("paciente_id", user.id)` para que cada quien vea sólo los suyos.

### Security

- Se dejó de trackear `.env` (`git rm --cached .env`). Contenía la URL y la
  *publishable/anon key* de Supabase. Esa key es pública por diseño (la
  seguridad depende de RLS), pero la buena práctica es no versionarla. El archivo
  local se mantiene para que la app siga corriendo.

---

## Decisiones tomadas (opción elegida vs. alternativas)

Según lo pedido, se registran las decisiones donde había más de una opción razonable:

1. **Acceso al repo (push).** El entorno no tiene credenciales del repo privado.
   - Elegido: se consultó y Carlos puso el repo en **público** para poder clonar.
   - Para el push quedan dos vías (a resolver con Carlos): agregar el repo a las
     *sources* autorizadas de la sesión, o proveer un PAT. Alternativa descartada
     por ahora: descargar/pushear vía navegador (poco práctico para muchos archivos).

2. **`.env` versionado.** Elegido: `git rm --cached` + `.gitignore` + `.env.example`.
   - Alternativas descartadas: (a) borrar la key del historial con filter-repo
     —descartada por ser reescritura de historia, rompe el sync con Lovable—;
     (b) dejar `.env` como estaba —descartada por mala práctica—.
   - Recomendación: si se quiere, rotar la publishable key en Supabase.

3. **Alcance de los cambios.** Elegido: cambios **aditivos** de docs/config/higiene,
   sin tocar código de features ni migraciones.
   - Alternativa descartada: refactor de código fuente —descartada porque el
     código ya está prolijo y un refactor arriesgaría el sync con Lovable y saldría
     del pedido ("cumplir la estructura y buenas prácticas").

4. **CI/CD.** Elegido: agregar `.github/workflows/ci.yml` con lint + build
   (la referencia lo lista como decisión cerrada típica).
   - Alternativa descartada: no agregar CI —descartada por ser buena práctica
     estándar—. No se incluyó step de tests porque el proyecto aún no tiene suite.

5. **Idioma de los docs.** Elegido: español, consistente con la referencia del
   bootcamp y con la UI del producto.
