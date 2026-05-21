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
