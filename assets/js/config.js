const SUPABASE_URL = 'https://nebstosmaahdbivndlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnN0b3NtYWFoZGJpdm5kbHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDM1NzMsImV4cCI6MjA5NDg3OTU3M30.wGEwTshOJe2mSA-mg0dTmOd6nZz4JH0s9ZIA26TbVUI';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    try {
        if (SUPABASE_URL && SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_URL.startsWith('http')) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn('Supabase URL no está configurada o es inválida. Iniciando en modo offline de contingencia.');
        }
    } catch (err) {
        console.error('Error al inicializar el cliente de Supabase:', err);
    }
}

const CONFIG = {
    email: 'catering.ellegado@gmail.com',
    whatsapp: {
        phone: '541176753854',
        messageTemplate: (productos, total, mensajePersonal) => 
            `Hola El Legado, me gustaría solicitar una cotización de catering.\n\n*Productos solicitados:*\n${productos}\n\n*Total estimado:* ${total}\n\n${mensajePersonal}\n\nQuedo atento a su respuesta.`
    },
    guests: {
        min: 50,
        minIncrement: 10
    },
    productos: {
        clasicos: [],
        premium: [],
        dulce: []
    }
};

const WHATSAPP_PHONE = CONFIG.whatsapp.phone;

async function loadProductsFromDB() {
    if (!supabaseClient) {
        console.warn('Supabase no disponible, usando productos por defecto');
        loadFallbackProducts();
        return;
    }
    
    try {
        const { data: clasicos, error: err1 } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('categoria', 'clasica')
            .eq('activo', true)
            .order('orden');
        
        const { data: premium, error: err2 } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('categoria', 'premium')
            .eq('activo', true)
            .order('orden');
        
        const { data: dulces, error: err3 } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('categoria', 'dulce')
            .eq('activo', true)
            .order('orden');
        
        if (err1 || err2 || err3) {
            console.error('Error cargando productos:', err1, err2, err3);
            loadFallbackProducts();
            return;
        }
        
        CONFIG.productos.clasicos = (clasicos || []).map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio > 0 ? item.precio : null,
            unidad: 'unidad',
            minimo: item.minimo || 50,
            incremento: item.incremento || 10,
            pendiente: item.pendiente || false,
            imagen_url: item.imagen_url || ''
        }));
        
        CONFIG.productos.premium = (premium || []).map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio > 0 ? item.precio : null,
            unidad: 'unidad',
            minimo: item.minimo || 50,
            incremento: item.incremento || 10,
            pendiente: item.pendiente || false,
            imagen_url: item.imagen_url || ''
        }));
        
        CONFIG.productos.dulce = (dulces || []).map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            precio: item.precio > 0 ? item.precio : null,
            unidad: 'unidad',
            minimo: item.minimo || 50,
            incremento: item.incremento || 10,
            pendiente: item.pendiente || false,
            imagen_url: item.imagen_url || ''
        }));
        
        console.log(`Productos cargados: ${CONFIG.productos.clasicos.length} clasicos, ${CONFIG.productos.premium.length} premium, ${CONFIG.productos.dulce.length} dulces`);
    } catch (err) {
        console.error('Error cargando productos desde DB:', err);
        loadFallbackProducts();
    }
}

function loadFallbackProducts() {
    CONFIG.productos.clasicos = [
        { id: 'canapes', nombre: 'Canapés', descripcion: 'Pan de chips con variantes: pollo pimentón, pollo ciboulette, huevo y tomate cherry', precio: 500, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'mini_hamburguesas', nombre: 'Mini Hamburguesas', descripcion: '3 variantes: Clásico, Aliloy, Gourmet', precio: 760, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'mini_empanadas', nombre: 'Mini Empanadas', descripcion: '4 rellenos: carne, jamón y queso, pollo, caprese', precio: 400, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'tapaditos', nombre: 'Tapaditos', descripcion: 'Pan figasa con 3 pastas', precio: 600, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'mini_pizzas', nombre: 'Mini Pizzas', descripcion: 'Napolitana: queso, tomate, jamón y aceituna', precio: 560, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'sopaipillas', nombre: 'Mini Sopaipillas con Pebre', descripcion: 'Sopaipillas tradicionales con pebre', precio: 400, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'mini_conitos', nombre: 'Mini Conitos', descripcion: 'Cono de rapidita rellenos', precio: 1440, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'sandwich_miga', nombre: 'Mini Sándwich de Miga', descripcion: 'Jamón y queso decorado', precio: 600, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'fosforitos', nombre: 'Fosforitos', descripcion: 'Jamón y queso', precio: 460, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' }
    ];
    
    CONFIG.productos.dulce = [
        { id: 'canastitas', nombre: 'Canastitas', descripcion: 'Relleno: crema, dulce de leche y mousse de chocolate', precio: 650, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'shots', nombre: 'Shots variados', descripcion: 'Variedad de sabores a elección', precio: 850, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' },
        { id: 'tacitas', nombre: 'Tacitas Rellenas', descripcion: 'Masa de hojaldre con relleno de crema', precio: 700, unidad: 'unidad', minimo: 50, incremento: 10, pendiente: false, imagen_url: '' }
    ];
}

async function guardarCotizacion(cotizacion) {
    if (!supabaseClient) {
        console.log('Supabase no configurado - cotización no guardada:', cotizacion);
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('cotizaciones')
            .insert([{
                tipo_evento: 'Catering',
                num_invitados: cotizacion.total_unidades,
                servicios: JSON.stringify(cotizacion.productos),
                presupuesto: cotizacion.total,
                cliente_nombre: cotizacion.cliente_nombre || null,
                cliente_email: cotizacion.cliente_email || null,
                cliente_telefono: cotizacion.cliente_telefono || null,
                estado: 'nueva'
            }]);
        
        if (error) throw error;
        console.log('Cotización guardada:', data);
        return data;
    } catch (err) {
        console.error('Error guardando cotización:', err);
        return null;
    }
}

function formatARS(value) {
    if (!value && value !== 0) return '$0';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getAllProducts() {
    return [...CONFIG.productos.clasicos, ...CONFIG.productos.premium, ...CONFIG.productos.dulce];
}

function getProductById(id) {
    return getAllProducts().find(p => p.id === id);
}

function getProductCategory(id) {
    if (CONFIG.productos.clasicos.find(p => p.id === id)) return 'clasica';
    if (CONFIG.productos.premium.find(p => p.id === id)) return 'premium';
    if (CONFIG.productos.dulce.find(p => p.id === id)) return 'dulce';
    return null;
}

async function loadSiteConfig() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('site_config')
            .select('*');
        if (error) { console.warn('CMS config not available:', error.message); return; }
        
        const config = {};
        data.forEach(c => { config[c.key] = c.value; });
        applySiteConfig(config);
    } catch (err) {
        console.warn('CMS config load failed:', err);
    }
}

function applySiteConfig(config) {
    // Apply colors as CSS custom properties
    const colors = config.colors || {};
    if (colors.primary) document.documentElement.style.setProperty('--brand-copper', colors.primary);
    if (colors.primaryLight) document.documentElement.style.setProperty('--brand-copper-light', colors.primaryLight);
    if (colors.background) document.documentElement.style.setProperty('--cream', colors.background);
    if (colors.text) document.documentElement.style.setProperty('--dark-elegant', colors.text);
    if (colors.textSecondary) document.documentElement.style.setProperty('--slate-500', colors.textSecondary);
    
    // Apply images
    const images = config.images || {};
    if (images['cms-img-hero']) {
        const hero = document.getElementById('inicio');
        if (hero) hero.style.backgroundImage = `url('${images['cms-img-hero']}')`;
    }
    
    // Apply text content
    const hero = config.hero || {};
    if (hero.title) {
        const el = document.querySelector('#inicio h1');
        if (el) el.textContent = hero.title;
    }
    if (hero.subtitle) {
        const el = document.querySelector('#inicio .text-brand-copper.tracking-\\[0\\.4em\\]');
        if (el) el.textContent = hero.subtitle;
    }
    if (hero.tagline) {
        const el = document.querySelector('#inicio p.text-xl');
        if (el) el.textContent = hero.tagline;
    }
    if (hero.ctaText) {
        const btn = document.querySelector('[data-whatsapp]');
        if (btn) btn.textContent = hero.ctaText;
    }
    
    // Apply hero stats
    const stats = hero.stats || [];
    for (let i = 0; i < 3; i++) {
        if (stats[i]) {
            const valEl = document.querySelector(`[data-hero-stat-value="${i + 1}"]`);
            const labelEl = document.querySelector(`[data-hero-stat-label="${i + 1}"]`);
            if (valEl) valEl.textContent = stats[i].value || '';
            if (labelEl) labelEl.textContent = stats[i].label || '';
        }
    }
    
    // Apply about/philosophy section (maps to #filosofia)
    const about = config.about || {};
    if (about.title) {
        const el = document.querySelector('#filosofia h2');
        if (el) el.textContent = about.title;
    }
    if (about.text) {
        const el = document.querySelector('#filosofia .font-serif.text-xl');
        if (el) el.innerHTML = about.text;
    }
    if (about.highlight) {
        const el = document.querySelector('#filosofia p.text-lg');
        if (el) el.textContent = about.highlight;
    }
    if (images['cms-img-about']) {
        const img = document.querySelector('#filosofia img');
        if (img) img.src = images['cms-img-about'];
        const source = document.querySelector('#filosofia source');
        if (source) source.srcset = images['cms-img-about'];
    }
    
    // Apply festin section
    const festin = config.festin || {};
    if (festin.title) {
        const el = document.querySelector('#festin h2');
        if (el) el.textContent = festin.title;
    }
    if (festin.subtitle) {
        const el = document.querySelector('#festin .text-slate-600.font-light');
        if (el) el.textContent = festin.subtitle;
    }
    if (festin.ctaText) {
        const btn = document.querySelector('[data-whatsapp-cotizar]');
        if (btn) btn.textContent = festin.ctaText;
    }
    if (images['cms-img-festin']) {
        const img = document.querySelector('#festin img');
        if (img) img.src = images['cms-img-festin'];
        const source = document.querySelector('#festin source');
        if (source) source.srcset = images['cms-img-festin'];
    }
    
    // Apply gallery images
    const galleryImgs = document.querySelectorAll('#galeria img');
    const gallerySources = document.querySelectorAll('#galeria source');
    for (let i = 0; i < 6; i++) {
        const imgUrl = images[`cms-img-gallery-${i + 1}`];
        if (imgUrl) {
            if (galleryImgs[i]) galleryImgs[i].src = imgUrl;
            if (gallerySources[i]) gallerySources[i].srcset = imgUrl;
        }
    }
    
    // Apply footer
    const footer = config.footer || {};
    if (footer.text) {
        const el = document.querySelector('footer .font-serif');
        if (el) el.textContent = footer.text;
    }
    if (footer.copyright) {
        const el = document.querySelector('footer .text-slate-500');
        if (el) el.textContent = `© 2026 ${footer.copyright}. Todos los derechos reservados.`;
    }
    
    // Apply social links
    const social = config.social || {};
    const socialLinks = document.querySelectorAll('[data-social]');
    socialLinks.forEach(link => {
        const platform = link.getAttribute('data-social');
        if (social[platform] && social[platform] !== '#') {
            link.href = social[platform];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
    
    // Apply contact info
    const contact = config.contact || {};
    if (contact.email) {
        const emailLinks = document.querySelectorAll('[data-email]');
        emailLinks.forEach(el => {
            el.href = `mailto:${contact.email}`;
            el.textContent = contact.email;
        });
    }
    if (contact.whatsapp) {
        const waLinks = document.querySelectorAll('[data-whatsapp]');
        const msg = encodeURIComponent('Hola El Legado, me gustaría obtener más información sobre sus servicios de catering.');
        waLinks.forEach(el => {
            el.href = `https://wa.me/${contact.whatsapp}?text=${msg}`;
        });
        // Update phone display
        const phoneEl = document.querySelector('[data-phone]');
        if (phoneEl) {
            const formatted = contact.whatsapp.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 $2 $3 $4');
            phoneEl.textContent = formatted;
        }
    }
    
    // Apply section visibility
    const sections = config.sections || {};
    const sectionMap = {
        'hero': 'inicio',
        'about': 'filosofia',
        'festin': 'festin',
        'gallery': 'galeria',
        'testimonials': 'testimonios',
        'contact': 'contacto',
        'comingSoon': 'proximamente',
        'footer': null
    };
    
    for (const [key, sectionId] of Object.entries(sectionMap)) {
        if (sectionId) {
            const el = document.getElementById(sectionId);
            if (el) {
                if (sections[key] === false) {
                    el.style.display = 'none';
                } else {
                    el.style.display = '';
                }
            }
        }
    }
}
