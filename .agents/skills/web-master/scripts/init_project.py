import os
import sys

def create_boilerplate(project_name="my-web-project"):
    os.makedirs(project_name, exist_ok=True)
    
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium Web Experience</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; }
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
    <!-- Navbar -->
    <nav class="fixed top-0 w-full z-50 glass">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
                WebMaster
            </div>
            <div class="hidden md:flex space-x-8 text-sm font-medium">
                <a href="#" class="hover:text-indigo-400 transition-colors">Inicio</a>
                <a href="#" class="hover:text-indigo-400 transition-colors">Servicios</a>
                <a href="#" class="hover:text-indigo-400 transition-colors">Proyectos</a>
                <a href="#" class="hover:text-indigo-400 transition-colors">Contacto</a>
            </div>
            <button class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
                Empezar
            </button>
        </div>
    </nav>

    <main>
        <!-- Hero Section -->
        <section class="relative pt-32 pb-20 px-4 overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10"></div>
            <div class="max-w-4xl mx-auto text-center">
                <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    Diseños <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">Premium</span> para la Era Digital
                </h1>
                <p class="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                    Construimos experiencias web rápidas, accesibles y visualmente impresionantes utilizando las últimas tecnologías.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all transform hover:scale-105">
                        Ver Portafolio
                    </button>
                    <button class="px-8 py-4 glass hover:bg-white/10 rounded-xl font-bold transition-all">
                        Más Información
                    </button>
                </div>
            </div>
        </section>
    </main>

    <footer class="py-10 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; 2026 WebMaster Studio. Todos los derechos reservados.
        </div>
    </footer>
</body>
</html>"""

    with open(os.path.join(project_name, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"Proyecto '{project_name}' inicializado con éxito.")

if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "web-project"
    create_boilerplate(name)
