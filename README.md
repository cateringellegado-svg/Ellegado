# El Legado - Catering y Eventos

Sitio web de El Legado Catering y Eventos - Argentina

## Stack
- HTML5 + TailwindCSS (build process)
- JavaScript vanilla
- Supabase (DB, Auth, Storage)
- Vercel (hosting)

## Desarrollo

### Prerequisitos
- Node.js 20+
- npm

### Instalación
```bash
npm install
```

### Build CSS (Tailwind)
```bash
npm run build
```

### Watch mode (desarrollo)
```bash
npm run dev
```

### Tests E2E
```bash
npm test
```

### Tests E2E con UI
```bash
npm run test:ui
```

## Estructura
```
├── index.html              # Página principal
├── admin/                  # Panel de administración
│   ├── index.html
│   ├── login.html
│   └── js/
├── assets/
│   ├── css/
│   │   ├── input.css       # Tailwind input
│   │   └── output.css      # Built CSS (no commitear)
│   └── js/
│       ├── config.js
│       └── main.js
├── tests/
│   └── e2e/                # Playwright tests
├── .github/workflows/      # CI/CD pipeline
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── playwright.config.js
```

## Deploy

### Vercel (Automático)
1. Push a `main`
2. GitHub Actions corre tests y deploy
3. Disponible en `ellegado.vercel.app`

### Variables de Entorno (Vercel)
Configurar en Vercel Dashboard > Settings > Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

### CI/CD Pipeline
- Push a `main` → Build → Tests → Deploy
- PR → Build → Tests (sin deploy)

## Legal
- Argentina (Ley 25.326)
- Teléfono: +54 11 7675 3854
- Email: catering.ellegado@gmail.com
