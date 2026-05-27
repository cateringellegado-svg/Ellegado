# Manual de Operaciones — El Legado

## 1. Gestión de Precios

### 1.1 Factor de Ajuste Global

El sistema usa un multiplicador global llamado `factor_ajuste` que se aplica a todos los precios del frontend.

- **Ubicación**: Admin Panel → Configuración → Gestión Financiera → Factor de Ajuste Global
- **Default**: `1.0` (sin ajuste)
- **Ejemplo**: `1.25` = todos los precios se incrementan un 25%
- **Efecto**: Inmediato en el frontend, no requiere rebuild

Todos los precios se calculan como: `precio_final = precio_base * factor_ajuste`

### 1.2 Precios por Persona

Se configuran desde Admin Panel → Configuración → Gestión Financiera → Precios por Persona:

- Bocados Salados
- Variedad Dulce
- Servicio Vajilla & Garzones
- Decoración & Montaje

Estos precios también se multiplican por `factor_ajuste` en el frontend.

## 2. Capacidad Diaria

### 2.1 Límite Global

- **Ubicación**: Admin Panel → Configuración → Gestión Operativa → Capacidad Diaria Total
- **Default**: `0` (sin límite)
- **Unidad**: Unidades totales por día
- **Validación**: Se compara contra los pedidos activos en `cotizaciones` con esa `fecha_entrega`

### 2.2 Capacidad por Combo

Cada combo tiene su propio límite diario (`capacidad_diaria`), configurable desde Admin Panel → CMS → Combos.

- `0` = sin límite para ese combo
- Se trackea via tabla `reservas_por_fecha` con UNIQUE(combo_id, fecha)

## 3. Token de Mercado Pago

### 3.1 Configuración

- **Ubicación**: Admin Panel → Configuración → Gestión Financiera → Mercado Pago
- **Campo**: `MERCADO_PAGO_ACCESS_TOKEN`
- **Formato**: `TEST-xxxxxxxxxxxxxxxxxxxxxx-xxxxxx` (sandbox) o `APP_USR-...` (producción)

### 3.2 Prioridad

El sistema usa este orden de prioridad para el token MP:

1. Token desde la tabla `configuracion` (admin-configurable)
2. Variable de entorno `MP_ACCESS_TOKEN` (fallback)

### 3.3 Webhook Post-Pago

El endpoint `/api/webhooks/mercadopago` recibe notificaciones de Mercado Pago cuando un pago se aprueba.

**Comportamiento**:
1. Verifica el pago contra la API de MP
2. Si está aprobado: actualiza `cotizaciones.pago_status = "paid"` y `estado = "confirmada"`
3. Envía mensaje de WhatsApp al cliente: "¡Confirmación de Seña recibida!..."
4. Registra en `admin_logs` para trazabilidad

**Configuración en MP Dashboard**:
- URL: `https://tudominio.com/api/webhooks/mercadopago`
- Eventos: `payment`

## 4. Gestión de Leads (Cotizaciones)

### 4.1 Flujo de Cotización

1. Cliente completa el wizard en "El Festín" (pasos 1-4)
2. Revisa el resumen y completa el formulario de cotización
3. Se envía el presupuesto por WhatsApp con detalle de productos
4. El lead queda como "nueva" en `cotizaciones`
5. Admin revisa desde Admin Panel → Cotizaciones

### 4.2 Estados

| Estado | Significado |
|--------|-------------|
| nueva | Recién ingresada, sin contacto |
| contactada | El admin contactó al cliente |
| confirmada | Cliente confirma el presupuesto |
| completada | Evento realizado |

### 4.3 Override Manual (Reserva Manual)

Cuando un cliente paga en efectivo o por transferencia directa:
1. Ir a Admin Panel → Cotizaciones
2. Hacer clic en "Reservar" en la fila correspondiente
3. El sistema marca `pago_metodo = "manual"`, `pago_status = "reserved"`, `reserva_manual = true`
4. Se registra en `admin_logs`

### 4.4 Exportación CSV

Botón "Exportar CSV" → descarga todas las cotizaciones filtradas en formato CSV con cabecera.

## 5. Reglas de Shabat y Calendario

### 5.1 Anticipación Mínima

```
fecha_entrega >= CURRENT_DATE + 2 días
```

### 5.2 Restricciones de Horario

| Día | Regla |
|-----|-------|
| Viernes | No se permiten entregas después de las 20:00 |
| Sábado | No hay entregas (Shabat) |
| Domingo | No se permiten entregas antes de las 13:00 |

### 5.3 Límite Máximo

No se pueden reservar entregas con más de 45 días de anticipación.

### 5.4 Avisos UX

El sistema muestra mensajes contextuales según el día elegido:
- Viernes: "Entrega artesanal con preparación anticipada"
- Sábado: "Preparación especial para entrega del sábado"

## 6. CMS del Sitio

### 6.1 Contenido Editable

Desde Admin Panel → CMS del Sitio se puede modificar:

- **Colores**: esquema de color de la marca
- **Imágenes**: hero, logo, galería, favicon
- **SEO**: meta titles, descripciones, keywords
- **Secciones**: textos de Hero, Filosofía, Festín, CTA, Footer
- **Redes Sociales**: URLs de Instagram, Facebook, TikTok
- **Contacto**: email y WhatsApp
- **Secciones**: mostrar/ocultar secciones completas
- **Combos**: nombre, descripción, precio, activo/inactivo

### 6.2 Gestión de Combos

Desde Admin Panel → CMS del Sitio → Combos:
- Editar nombre, descripción y precio de cada combo
- Activar/desactivar combos individualmente
- Guardar cambios combo por combo

## 7. Seguridad de Pagos

### 7.1 Checklist de Seguridad

- [ ] `MP_ACCESS_TOKEN` almacenado en la tabla `configuracion` (encriptado via RLS)
- [ ] Webhook configurado en MP Dashboard apuntando a `/api/webhooks/mercadopago`
- [ ] Rate limiting activo en `/api/cotizaciones` (5 requests/minuto por IP)
- [ ] Validación de schema via Zod en endpoint de cotizaciones
- [ ] RLS activo en todas las tablas (SELECT público, INSERT/AUTH autenticado)

### 7.2 Políticas RLS

| Tabla | SELECT | INSERT/UPDATE |
|-------|--------|---------------|
| menu_items | público | authenticated |
| combos | público | authenticated |
| cotizaciones | público | authenticated |
| configuracion | público | authenticated |
| admin_logs | authenticated | authenticated |
| reservas_por_fecha | público | authenticated |
| pagos | authenticated | authenticated |

### 7.3 Variables Editables por el Administrador (Cero Hardcoding)

| Variable | Ubicación en Admin |
|----------|-------------------|
| factor_ajuste_precio | Configuración → Gestión Financiera |
| MERCADO_PAGO_ACCESS_TOKEN | Configuración → Gestión Financiera |
| capacidad_diaria_total | Configuración → Gestión Operativa |
| Nombre de combos | CMS → Combos |
| Descripción de combos | CMS → Combos |
| Precio de combos | CMS → Combos |
| Textos de todas las secciones | CMS → cada sección |
| Número de WhatsApp | Configuración → Gestión Operativa |
| Precios por persona | Configuración → Gestión Financiera |
| Colores del sitio | CMS → Colores |
| Imágenes del sitio | CMS → Imágenes |

## 8. Trazabilidad (Logs)

Todas las acciones importantes del admin se registran en `admin_logs`:

| Acción | Disparador |
|--------|-----------|
| `configuracion_actualizada` | Guardar configuración |
| `pago_mp_aprobado` | Webhook de MP |
| `reserva_manual` | Clic en "Reservar" en cotizaciones |
| `webhook_recibido` | Webhook de MP recibido |
| `cotizacion_estado_cambiado` | Cambio de estado en cotizaciones |

Los logs se visualizan desde:
- Configuración → Trazabilidad (todos los eventos del sistema)
- Cotizaciones → Trazabilidad (eventos relacionados a cotizaciones)

## 9. Escalamiento de Capacidad Diaria

Para escalar la capacidad diaria:

1. **A corto plazo**: Aumentar `capacidad_diaria_total` desde Configuración → Gestión Operativa
2. **A largo plazo**: Agregar personal de cocina y logística
3. **Por combo**: Ajustar `capacidad_diaria` individual de cada combo desde CMS → Combos
4. **Monitoreo**: Revisar `reservas_por_fecha` en la base de datos para ver tendencias de ocupación

## 10. Troubleshooting

### 10.1 Los precios no se actualizan en frontend
- Verificar que `factor_ajuste` se guardó correctamente en `configuracion`
- Refrescar la página (el valor se carga al montar el componente)
- Ver que `fetchConfiguracion()` en `src/lib/supabase.ts` no tenga errores

### 10.2 El webhook de MP no funciona
- Verificar que `mp_access_token` esté configurado en Admin Panel
- Verificar que la URL del webhook en MP Dashboard sea correcta
- Revisar los logs en Admin Panel → Trazabilidad

### 10.3 No se pueden crear reservas
- Verificar `capacidad_diaria_total` no esté excedida para la fecha elegida
- Verificar que la fecha no exceda 45 días desde hoy
- Verificar que la fecha sea >= hoy + 2 días
- Revisar el trigger `validate_order_rpc_leads` en la base de datos
