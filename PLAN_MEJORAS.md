# Plan de Mejoras — El Legado Catering

> Generado el 28 de mayo de 2026 basado en evaluación integral del proyecto.

---

## Prioridad Inmediata — Seguridad

- [ ] **Agregar `admin/` a `.vercelignore`** — Evita deploy del login HTML legacy
- [ ] **Verificar firma en webhook MP** — Implementar validación `x-signature` en `/api/webhooks/mercadopago`
- [ ] **Mover MP tokens a environment variables** en vez de DB pública (tabla `config`)
- [ ] **Validar `?redirect=`** en login admin para prevenir open redirect

## Prioridad Alta — Cobertura de Tests

- [ ] **Configurar cobertura en Vitest** con mínimo 40-50% (agregar `coverage` en `vitest.config.ts`)
- [ ] **Testear `ConsultantWizard`** (~500 líneas, flujo crítico de 4 pasos)
- [ ] **Testear `ComboSelector`** (~160 líneas, recomendación y selección de combos)
- [ ] **Testear `SalesSummary`** (~200 líneas, carrito + MP + WhatsApp)
- [ ] **Testear `supabase.ts`** (12 funciones del data layer)
- [ ] **Testear API `create-preference`** (integración Mercado Pago)
- [ ] **Testear API `webhooks/mercadopago`** (notificaciones de pago)

## Prioridad Media — Calidad de Código

- [ ] **Agregar Prettier** para formateo consistente
- [ ] **Refactorizar `goToStep4` / `goToPersonalizar`** en tests del Festin (desacoplar pasos del wizard)
- [ ] **Revisar `console.log` residuales** en toda la base de código

## Prioridad Media — Arquitectura

- [ ] **Implementar roles de admin** (admin/editor/viewer) en Supabase
- [ ] **Reemplazar `SECURITY DEFINER`** por `SECURITY INVOKER` en RPCs sensibles
- [ ] **Agregar HSTS** en `next.config.ts`
- [ ] **Tighten CSP** — Evaluar si `unsafe-eval` es realmente necesario

## Prioridad Media — Infraestructura

- [ ] **Agregar `Strict-Transport-Security`** header (`max-age=31536000; includeSubDomains`)
- [ ] **Fortalecer secret scanner en CI** — Usar gitleaks, trufflehog o similar
- [ ] **Agregar `npm audit`** al pipeline de CI
- [ ] **Agregar rate limiting** en tamaño de requests (body size limit)

## Prioridad Baja — Largo Plazo

- [ ] **Testear flujo E2E completo del wizard Festin** (social → 50 pers → fecha → combo → cotizar)
- [ ] **E2E de pagos** con Mercado Pago sandbox
- [ ] **Tests de accesibilidad** (axe-core + Playwright)
- [ ] **Dockerizar** para entornos locales consistentes
- [ ] **Auditoría de dependencias** programada regularmente

---

## Resumen de Hallazgos

| Área | Estado Actual |
|---|---|
| **TypeScript strict** | ✅ `strict: true` |
| **ESLint** | ✅ `eslint-config-next` |
| **Formateador** | ❌ No hay (Prettier/Biome) |
| **Tests unitarios** | ⚠️ 65 tests, 80% de componentes sin cobertura |
| **Tests E2E** | ⚠️ 18 tests, solo homepage + redirects admin |
| **Cobertura configurada** | ❌ No existe |
| **Seguridad pagos** | 🔴 Crítico — webhook sin firma, tokens expuestos |
| **Autorización** | 🔴 Cualquier usuario autenticado es admin total |
| **CI/CD** | ✅ Build + tsc + Playwright + Deploy Vercel |
