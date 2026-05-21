---
name: admin-panel
description: Experto en crear y mantener paneles de administración con Supabase y Tailwind CSS. Incluye autenticación, gestión de datos, dashboards y configuración.
---

# Admin Panel Skill - El Legado

## Perfil de Ejecución
Eres un desarrollador fullstack especializado en paneles de administración. Tu objetivo es crear interfaces de gestión intuitivas y funcionales que permitan al administrador controlar todos los aspectos del negocio.

## Stack Tecnológico
- **Frontend**: HTML5 + Tailwind CSS (mismas características premium que web-master)
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **Estilo**: Coherente con el sitio público "El Legado" (colores cobre, tipografía Cormorant Garamond)

## Estructura del Proyecto

```
admin/
├── index.html        # Panel principal con todas las secciones
├── login.html        # Página de autenticación
├── css/              # Estilos (vacio, usa Tailwind CDN)
├── js/
│   ├── config.js     # Configuración Supabase
│   └── app.js        # Lógica del panel
```

## Tablas de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `cotizaciones` | Cotizaciones generadas por clientes |
| `clientes` | Base de datos de clientes |
| `menu_items` | Items del menú con precios |
| `eventos` | Calendario de eventos confirmados |
| `config` | Configuración global (precios, WhatsApp) |

## Funcionalidades del Panel

### 1. Dashboard
- Stats: cotizaciones del mes, eventos confirmados, clientes registrados
- Ingresos estimados del mes
- Lista de cotizaciones recientes

### 2. Cotizaciones
- Tabla con filtros por estado
- Estados: nueva → contactada → confirmada → completada
- Cambio de estado inline
- Modal de detalle
- Eliminación

### 3. Clientes
- Lista de clientes con datos de contacto
- Conteo de eventos por cliente

### 4. Menús
- Gestión de items por categoría (salado/dulce)
- Activar/desactivar items
- Precios y etiquetas dietéticas

### 5. Eventos
- Calendario mensual
- Vista de eventos por fecha

### 6. Configuración
- Precios por persona
- Número WhatsApp
- Rango de invitados

## Integración con Sitio Público

Cuando un cliente usa el cotizador:
1. Se calculan servicios y presupuesto
2. Antes de abrir WhatsApp, se guarda en Supabase
3. La cotización aparece en el panel admin con estado "nueva"

## Mandamientos de Mantenimiento

1. **Coherencia Visual**: El admin debe verse igual de premium que el sitio público
2. **Actualización de Precios**: Si cambias precios en el admin, se reflejan en el cotizador
3. **Estados**: Mantener actualizados los estados de cotizaciones y eventos
4. **Backups**: Supabase maneja esto automáticamente en el plan gratuito

## Archivos Clave

- `admin/js/config.js` - Conexión a Supabase
- `admin/js/app.js` - Lógica CRUD completa
- `assets/js/config.js` - Configuración del sitio público
- `assets/js/main.js` - Cotizador con guardado de datos

## Cómo Dar Acceso al Cliente Final

1. **Crear usuario en Supabase**:
   - Ve a Authentication → Users
   - Click en "Invite user"
   - Ingresa el email del cliente

2. **El cliente recibe email**:
   - Click en el enlace del email
   - Crea su contraseña
   - Ya puede acceder a `admin/login.html`

3. **Limitaciones sugeridas**:
   - Por ahora el panel es para ti (el admin)
   - El cliente solo necesita ver cotizaciones en WhatsApp

## Referencia Rápida

| Acción | Archivo a modificar |
|--------|---------------------|
| Cambiar colores | `index.html` (Tailwind config) |
| Agregar campo a cotización | `cotizaciones` table + `app.js` |
| Nuevo servicio | `menu_items` table + `index.html` |
| Cambiar precios | Panel admin sección Config |
| Ver cotizaciones | Panel admin → Cotizaciones |