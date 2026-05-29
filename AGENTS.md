<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:auditor-integral -->
# Auditor Integral

Skill disponible en `.opencode/skills/auditor-integral/`. Se activa con `LoadSkill auditor-integral`. Auditoría de 4 pilares: cables sueltos (UI), contratos rotos (Front vs API), fugas UX, código huérfano. Escanea `src/app/admin` y el flujo del cliente.
<!-- END:auditor-integral -->

## Goal
Eliminar fuentes duales, fallos de UX y variables fantasma antes del despliegue; añadir CRUD de testimonios; estabilizar tests E2E.

## Constraints & Preferences
- Toda edición del Footer debe centralizarse exclusivamente en `/admin/cms`.
- Toast debe decir la verdad cuando MP falla (no mentir con "éxito").
- Número de WhatsApp debe venir de `site_config` o constante, no de variable de entorno fantasma.
- Testimonios CRUD debe seguir patrón de combos (ConfirmDialog, fetch/create/update/delete en `lib/supabase.ts`).
- Tests E2E deben ser resistentes a scroll flaky.

## Progress
### Done
- Eliminado test obsoleto `src/app/admin/__tests__/cms-combos.test.tsx` (testeaba combos en CMS, ya extirpados).
- Actualizadas rutas legales en `tests/e2e/critical-paths.spec.ts` (`/aviso-legal` → `/politicas-contratacion`, `/privacidad` → `/politicas-privacidad`, `/terminos` → `/terminos-y-condiciones`).
- Añadido per-key try/catch en `saveAll` de CMS; errores "Failed to fetch" traducidos a "Error de red - verifica tu conexión".
- Arqueología Legal (git): confirmados textos originales (seña 50%, cancelación 15/7d, ajuste IPC, condición WhatsApp) ya presentes en `site_config` vía migración SQL. Checkbox, toast y WhatsApp footer ya usan redacción original.
- Creado `/admin/testimonios` (CRUD completo: nombre, mensaje, evento, rating, menú, activo, orden) con tabla + modal crear/editar.
- Añadidas funciones `fetch/create/update/deleteTestimonialAdmin` a `src/lib/supabase.ts`.
- Agregado "Testimonios" al sidebar y breadcrumbs en `layout.tsx`.
- Corregidos hrefs rotos en DEFAULT_CMS.navbar: `#hero`→`#inicio`, `#about`→`#filosofia`, `#gallery`→`#galeria`, `#contact`→`#contacto`.
- Estabilizados tests E2E flaky: scroll sections usa `scrollIntoView({block:"center"})`; back-to-top emite `dispatchEvent(new Event("scroll"))` tras scrollTo.
- Eliminada fuente dual de Footer en `/admin/configuracion`: borrados `footer_schedule` del interface, DEFAULT_CONFIG, lógica de carga/guardado y UI de horarios. Footer ahora exclusivo de `/admin/cms`.
- Reparado toast engañoso en `CotizacionModal.tsx`: cuando paso 1 (DB) funciona pero paso 2 (MP) falla, muestra "Cotización guardada. Redirigiendo a WhatsApp para finalizar..." en amarillo.
- Eliminada variable fantasma `WHATSAPP_PHONE` de `.env.example`. El número se lee desde `config.contact.whatsapp` (site_config) con fallback a `WHATSAPP_NUMBER` en `constants.ts`.
- Eliminados tests de `footer_schedule` en `configuracion.test.tsx` (7 tests) — la funcionalidad ya no existe en Configuración.

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Footer eliminado de Configuración para eliminar fuente dual con CMS. CMS es única fuente de verdad.
- Toast de éxito condicional: distingue entre flujo completo (MP ok) y fallback (MP caído) para no engañar al usuario.
- `WHATSAPP_PHONE` removida del `.env.example` porque nunca se leyó con `process.env`; el número real está hardcodeado en `constants.ts` y es sobreescribible vía site_config.
- Tests scroll usan `scrollIntoView` nativo + dispatchEvent para evitar flakiness con `scrollTo` programático.

## Next Steps
- (none — todos los marcadores rojos críticos resueltos)

## Critical Context
- **TypeScript check:** `npx tsc --noEmit --pretty` — 0 errores.
- **Unit tests:** `npm run test:unit` (vitest) — 13/13 files, 111 tests passed.
- **E2E tests:** `npm test` (playwright) — 36/36 passed.
- **SQL migration:** `20260529235500_add_legal_docs_site_config.sql` ya ejecutada en sesión anterior.
- **Git:** `main` branch, commits `c7dcbb8` (fix E2E rutas), `1ef99d9` (fix error handling CMS), `bcf6e45` (legal + combos dinámicos), más commits anteriores.
- **Pendiente en .env.local:** faltan 4 variables MP (`MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN_TEST`, `MP_WEBHOOK_SECRET`) — el usuario debe cargarlas manualmente.
- **Tablas huérfanas no resueltas:** `facturas`, `gastos`, `presupuestos_detalle`, `reservas_por_fecha` — sin interfaz de gestión (fuera del alcance).

## Relevant Files
- `src/app/admin/testimonios/page.tsx`: Nuevo CRUD de testimonios (tabla + modal).
- `src/app/admin/configuracion/page.tsx`: Eliminado `footer_schedule` (interface, DEFAULT_CONFIG, load, save, UI).
- `src/app/admin/__tests__/configuracion.test.tsx`: Eliminados 7 tests de footer schedule.
- `src/components/CotizacionModal.tsx`: Toast corregido con mensaje diferenciado para fallo de MP; eliminado `preferenceError` (muerto).
- `.env.example`: Eliminada sección `WHATSAPP_PHONE`.
- `tests/e2e/critical-paths.spec.ts`: Scroll test con `scrollIntoView` + dispatchEvent; rutas legales actualizadas.
- `src/app/admin/cms/page.tsx`: DEFAULT_CMS.navbar hrefs corregidos; error handling robusto en saveAll/save.
- `src/lib/supabase.ts`: Nuevas funciones `fetch/create/update/deleteTestimonialAdmin`.
