# Changelog

Todas las modificaciones notables del proyecto se documentan aquí.

## [1.1.0] — 2026-05-25

### Added
- Subida de imágenes a productos desde admin (menús)
- Input file + drag & drop en modal de crear/editar item
- Upload a Supabase Storage bucket `menu-images`
- Preview de imagen con placeholder
- Quick upload desde la lista de items
- Eliminación de imagen del storage al quitarla
- Validaciones: tipo imagen, máximo 5MB
- `src/lib/storage.ts`: funciones helper para Supabase Storage

### Fixed
- CSP: agregado `connect-src` con Supabase URL + WebSocket
- not-found.tsx, error.tsx, loading.tsx (público + admin)
- Eliminado `saveCotizacion` (código muerto)
- Hero: migrado `backgroundImage` CSS → `next/image` con `priority`
- Tests: 26/26 pasando (corregidos mobile menu, back-to-top, legal pages, navigation scroll)

## [1.0.0] — Migración a Next.js

Migración completa de sitio HTML estático a Next.js 16 App Router con TypeScript, Tailwind v4, Supabase.
