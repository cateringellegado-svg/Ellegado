Nombre del Proyecto: "El Legado"
Propósito: Es una plataforma digital de gestión de catering y eventos que busca profesionalizar la experiencia del usuario desde la consulta hasta la contratación, permitiendo la personalización de combos y experiencias gastronómicas con reglas de negocio claras para cocina.

Objetivo Estratégico
Transformar el proceso de reserva de un flujo manual/informal a un sistema autogestionable que garantice que solo se acepten pedidos que cumplan con la capacidad operativa de la cocina, optimizando el tiempo y reduciendo la fricción en la cotización.

Funcionalidades Core (El "Motor")
1. Motor de Reservas Inteligente (Frontend)
Gestión de Combos Dinámicos: Selector basado en la Matriz de Capacidad (10-15, 20-25, 30-35, 40-45, 50-55 personas), asegurando que el precio se ajuste automáticamente según el rango seleccionado.

Catálogo de Experiencias (Menús Independientes):

Regla de restricción estricta: mínimo de 50 unidades.

Selector de cantidad en múltiplos de 10.

Visualización clara de "Precio Unitario" vs "Precio Total por lote".

Cálculo de Cotización en Tiempo Real: Validación automática antes de permitir el botón "Siguiente", evitando que el usuario solicite capacidades fuera de rango.

2. Backend y Base de Datos (Supabase)
Fuente Única de Verdad: Centralización de la matriz de precios y combos en la base de datos (no "hardcodeado" en el código), permitiendo cambios rápidos desde el dashboard de Supabase.

Gestión de Contenidos: Separación de datos estáticos (horarios, testimonios, descripciones de productos) en archivos o tablas editables para que el frontend los consuma dinámicamente sin necesidad de tocar el código fuente.

3. Integración de Pagos (Mercado Pago)
Manejo de Transacciones: Integración para procesar reservas mediante tokens de Mercado Pago, permitiendo estados de transacción (success/failure) que el usuario pueda ver en tiempo real.

4. Comunicación y Operación
Botón de Contacto Directo: Integración con WhatsApp configurada con el número de negocio, facilitando el cierre de ventas asistido.

Validación de Eventos: El sistema bloquea pedidos que no cumplan con el mínimo de 10 personas (para combos) o 50 (para menús individuales), protegiendo la viabilidad de la producción.

Funcionalidades Críticas del Backend (El Cerebro):Orquestación de Reglas de Negocio (Business Logic Layer):No solo almacena datos, valida comportamientos. El backend debe ejecutar las restricciones de capacidad (10/50 personas) independientemente de lo que intente hacer el frontend. Si alguien intenta saltarse la validación desde el navegador, el backend debe rechazar la transacción por seguridad.Gestión de Inventario y Producción (Inventory/Kitchen Logic):El backend debe traducir un "Combo 3" en una lista de ingredientes/cantidades de productos terminados para que la cocina sepa exactamente qué preparar.Sistema de Autenticación y Permisos (RBAC):Gestión de quién puede cambiar precios, quién puede modificar horarios y quién puede acceder a los reportes de ventas.Middleware de Pagos (Payment Orchestrator):No solo recibe un pago; el backend debe verificar que el monto pagado coincida exactamente con la cotización generada, evitando fraudes o errores de precio.API Centralizada:Tu frontend debe ser "tonto" (en el buen sentido). No debe contener lógica de negocio propia; solo debe preguntar al backend: "¿Puedo hacer esta reserva?" y mostrar la respuesta que el backend (el soberano) le devuelva.Comparativa: Frontend vs. BackendCaracterísticaFrontend (La Cara)Backend (El Cerebro)RolPresentación y UX.Reglas de negocio y seguridad.ComplejidadBaja (UI/UX).Alta (Lógica, Seguridad, Datos).ResponsabilidadMostrar el catálogo.Definir qué es vendible y a qué precio.ConexiónConsume datos.Gestiona todo el ciclo de vida del negocio.

# Changelog

## 2026-05-31 — Fix crítico RLS: role en app_metadata, no user_metadata
- **Diagnóstico**: `auth.users.role = 'admin'` (editado manualmente) + `user_metadata.role = "admin"` → JWT con `role: admin` → PostgREST `SET ROLE admin` falla → `role "admin" does not exist` en cada write
- **Fix**: `auth.users.role` restaurado a `'authenticated'` vía API; `"role":"admin"` movido de `user_metadata` a `app_metadata`; código actualizado (`login/page.tsx:35`, `proxy.ts:37`) para leer de `app_metadata.role`
- **Regla documentada**: jamás usar `"role"` como key en `user_metadata` — conflicto con sistema de roles de PostgreSQL
- **Validación**: TSC 0 err, 122/122 tests OK

## 2026-05-31 — Smart Scaling: upselling en gaps de combos + infra cerrada
- `ComboSelector.tsx`: implementado banner de upselling que detecta automáticamente cuando el número de invitados cae en un gap (16-19, 26-29, 36-39, 46-49) y recomienda el combo superior
- `ConsultantWizard.tsx`: corregido `getRecommendedCombo` que mapeaba thresholds incorrectos (16-17 → Esencia) ahora redirige al rango correcto (16-19 → Celebración)
- `PROYECTO_MEMORIA.md`: documentada Estrategia Comercial de Optimización de Menú — no crear combos redundantes, usar upselling Smart Scaling
- Riesgo infra cerrado: `SUPABASE_SERVICE_ROLE_KEY` verificada en Vercel por el usuario (Production, Preview, Development)
- Validación: TSC 0 err, 122/122 tests OK

## 2026-05-31 — Refactorización DRY: formatters compartidos, min/step dinámicos, duplicados eliminados
- Creado `src/lib/formatters.ts` con `formatARS()` y `calcAnticipo()` como fuente única de verdad
- `Festin.tsx`: importa formatters en vez de definir localmente; `min={50}`/`step={10}` → `producto.minimo`/`producto.incremento`; eliminado `setFactorAjuste` duplicado; simplificada lógica redundante en `handleQuantityChange` y `adjustQuantity`
- `SalesSummary.tsx`: importa `formatARS` desde formatters (eliminada definición local)
- `ComboSelector.tsx`: importa `formatARS` desde formatters (eliminada definición local)
- `CotizacionModal.tsx`: importa `calcAnticipo` desde formatters (eliminados 3 inline `Math.round(total * 0.5)`)
- Validación: TSC 0 err, lint 0 err, 122/122 tests OK
- Infra: Vercel CLI no autenticado localmente — usuario debe verificar `SUPABASE_SERVICE_ROLE_KEY` en Vercel Dashboard manualmente

## 2026-05-31 — Recuperación textos legales + link en cotización
- Restaurados textos originales de `politicas_contratacion`, `politicas_privacidad` y `terminos_condiciones` en `DEFAULT_CMS` del admin (`cms/page.tsx`)
- Insertados mismos textos en DB `site_config` (3 keys PATCH vía API)
- CotizacionModal: reemplazado `<button>` togglizador por `<a href="/politicas-contratacion" target="_blank">` real
- Footer: confirmados 3 links legales presentes
- Admin CMS: confirmados textareas + guardar para cada texto legal
- Validación: TSC 0 err, lint 0 err, 122/122 tests OK

## 2026-05-31 — Auditoría Global 28-Agentes (Sincronización)
### Backend (Combos vs Matriz) — OPERATIVO
- Schema: campos `personas_min`/`personas_max` en `combos`, `minimo`/`incremento` en `menu_items` → correctos
- RLS: SELECT público activo en ambas tablas → OK
- Cobertura: 5 combos cubren 10-15, 20-25, 30-35, 40-45, 50-55 → 4 gaps lógicos (16-19, 26-29, 36-39, 46-49)
- No requiere migración de schema — los gaps son decisión de negocio

### Frontend (Catálogo) — EN PROCESO
- Precios: unitario + total por lote mostrados correctamente, formatARS() funciona → OK
- Selector: step={10} y min={50} hardcodeados en HTML (`Festin.tsx:431-432`) en vez de usar campos de DB `producto.incremento`/`producto.minimo` → ISSUE
- Lógica duplicada: `formatARS` en 3 componentes, `calcAnticipo` duplicado → deuda técnica
- `factor_ajuste` aplicado correctamente en todos los cálculos → OK

### Content (Testimonios + Horarios) — OPERATIVO
- Testimonios: 100% editables desde DB `testimonials`, CRUD admin en `/admin/testimonios`, safety timer 10s
- Horarios Footer: 100% editables desde `site_config` key='footer' → schedule, CMS admin sección Footer, fallback DEFAULT_FOOTER
- Sin texto quemado en código fuente

### Infra (SUPABASE_SERVICE_ROLE_KEY) — OPERATIVO (con riesgo)
- Key presente en `.env.local`, formato válido
- Solo se usa en `src/app/api/webhooks/mercadopago/route.ts:7` (webhook MP)
- Validación: si falta → response 503 "Supabase not configured"
- ✅ Verificada manualmente por el usuario en Vercel Dashboard (Production, Preview, Development)
- Riesgo cerrado: `SUPABASE_SERVICE_ROLE_KEY` operativa en los 3 entornos de Vercel

### Diagnóstico y Fix Final: Escalado de Privilegios Admin

| Aspecto | Detalle |
|---|---|
| **Error original** | `role "admin" does not exist` en writes del CMS |
| **Causa raíz** | `auth.users.role` fue editado a `'admin'` por el usuario + `user_metadata.role = "admin"` → JWT generado con `role: "admin"` → PostgREST intenta `SET ROLE admin` → no existe → error |
| **Fix aplicado** | `auth.users.role` restaurado a `'authenticated'` vía Auth Admin API; `"role":"admin"` movido a `app_metadata`; código actualizado para leer de `app_metadata.role` |
| **Archivos cambiados** | `login/page.tsx:35`: `user_metadata.role` → `app_metadata.role`; `proxy.ts:37`: idem |
| **Regla de oro** | **NUNCA** poner `"role"` como key en `user_metadata` — interfiere con el JWT `role` claim de PostgreSQL |
| **Refresco** | Usuario debe cerrar sesión → volver a iniciar → el nuevo JWT tendrá `role: authenticated` (RLS funciona) + `app_metadata.role: admin` (app permite acceso) |

### Estrategia Comercial: Optimización de Menú (Smart Scaling)
- Política: Se han eliminado los "gaps" de combos intermedios (16-19, 26-29, etc.).
- Justificación: El sistema utiliza una lógica de upselling basada en ComboSelector.tsx que detecta cuando el número de invitados cae en un rango de "gap" y recomienda amigablemente el combo superior.
- Beneficio: Reducción de la carga logística en cocina, estandarización de procesos y mejora en la percepción de valor del cliente al ofrecerle opciones optimizadas.