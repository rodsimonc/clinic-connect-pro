# DESIGN.md

## Propósito

Contexto de diseño para agentes de IA (y personas) que generen o revisen UI de
este producto. Fuente de verdad de los tokens: **`src/styles.css`** (bloque
`@theme` de Tailwind v4). Mantener este archivo bajo 400 líneas.

## Producto

- **Nombre:** Clinic Connect Pro (clínica demo).
- **Audiencia:** pacientes (reserva de turnos self-service, mayormente mobile) y
  staff de la clínica (panel de administración, escritorio).
- **Tono visual:** cálido y confiable, sobrio institucional del rubro salud.
- **Principios:**
  - Claridad sobre densidad — jerarquía antes que mostrar todo junto.
  - Explicitud sobre inferencia — estados de carga, error y vacío siempre con texto.
  - Consistencia sobre creatividad — una tabla se ve como todas las tablas.
  - Confianza — la UI de salud transmite seguridad y calma, no urgencia.

## Sistema visual

- **Tokens:** definidos en `src/styles.css` (`@theme inline` + `:root` / `.dark`).
  Usar variables (`--color-primary`, `--color-accent`, etc.), nunca hex hardcodeado.
- **Paleta:** teal profundo (primario) + arena cálida (secundario) + ámbar de
  acento. Sin violeta. Estados: `success`, `warning`, `destructive` como tokens.
- **Tipografía:** `--font-display` = Fraunces (títulos), `--font-sans` = Manrope (texto).
- **Radios:** escala basada en `--radius` (0.875rem): `--radius-sm` … `--radius-4xl`.
- **Modo oscuro:** soportado vía variante `.dark`; todo color nuevo se define en ambos modos.
- **Iconografía:** lucide-react (ya es dependencia). No mezclar sets de íconos.

## Accesibilidad — mínimos no negociables

- Contraste AA (4.5:1 texto normal, 3:1 texto grande).
- Foco visible en todos los elementos interactivos (usar `--color-ring`).
- Áreas táctiles ≥ 44×44px.
- Todo flujo completable solo con teclado.
- Alt text en toda imagen informativa.
- Formularios con `<label>` asociado y mensajes de error explícitos.

## Componentes — inventario

Base: **shadcn/ui** (estilo new-york) en `src/components/ui/`. No duplicar; extender.

| Componente        | Estado  | Ubicación                        | Notas                              |
| ----------------- | ------- | -------------------------------- | ---------------------------------- |
| Button            | Estable | `src/components/ui/button.tsx`   | Variantes vía `class-variance-authority` |
| Card              | Estable | `src/components/ui/card.tsx`     | Base de listados de médicos/especialidades |
| Form + Input      | Estable | `src/components/ui/form.tsx`     | react-hook-form + zod              |
| Table             | Estable | `src/components/ui/table.tsx`    | Usar en admin; paginar si >50 filas |
| Dialog / Sheet    | Estable | `src/components/ui/`             | Para reserva y edición de turnos   |
| Header / Footer   | Estable | `src/components/site/`           | Layout del sitio                   |

## Reglas de composición

- Un formulario tiene un solo botón primario.
- Un Dialog no contiene otro Dialog.
- Las tablas con >50 filas requieren filtros o paginación.
- Estados de turno (`solicitado`, `confirmado`, `cancelado`, `atendido`,
  `ausente`) usan Badge con color semántico consistente en toda la app.

## Lo que NO hacemos

- No usar emojis en UI de producto.
- No introducir una librería de componentes nueva sin discusión.
- No diseñar pantallas sin estado vacío definido.
- No colores hex sueltos: siempre tokens de `src/styles.css`.

## Referencias

- Tokens: `src/styles.css`.
- Componentes: `src/components/ui/` (shadcn) — config en `components.json`.
- Convenciones de agentes: [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md).
