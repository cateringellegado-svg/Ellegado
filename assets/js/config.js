const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

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
        clasicos: [
            {
                id: 'canapes',
                nombre: 'Canapés',
                descripcion: 'Pan de chips con variantes: pollo pimentón, pollo ciboulette, huevo y tomate cherry, choclo y morrón, palmito y morrón, salame y aceituna negra, aceituna verde',
                precio: 500,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'mini_hamburguesas',
                nombre: 'Mini Hamburguesas',
                descripcion: '3 variantes: Clásico (carne, mayo, lechuga, tomate), Aliloy (carne, queso tybo, cebolla salteada, salsa aliloy), Gourmet (carne, tomate cherry, rúcula, queso azul)',
                precio: 760,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'mini_empanadas',
                nombre: 'Mini Empanadas',
                descripcion: '4 rellenos: carne, jamón y queso, pollo, caprese',
                precio: 400,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'tapaditos',
                nombre: 'Tapaditos',
                descripcion: 'Pan figasa con 3 pastas: pollo pimentón y morrón, pollo ciboulette y tomate cherry, jamón, queso, tomate y queso crema',
                precio: 600,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'mini_pizzas',
                nombre: 'Mini Pizzas',
                descripcion: 'Napolitana: queso, tomate, jamón y aceituna',
                precio: 560,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'sopaipillas',
                nombre: 'Mini Sopaipillas con Pebre',
                descripcion: 'Sopaipillas tradicionales con pebre',
                precio: 400,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'mini_conitos',
                nombre: 'Mini Conitos',
                descripcion: 'Cono de rapidita rellenos con: pollo, tomate, mayo y lechuga | carne, tomate y lechuga | jamón, queso, choclo, tomate y aceituna',
                precio: 1440,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'sandwich_miga',
                nombre: 'Mini Sándwich de Miga',
                descripcion: 'Jamón y queso decorado con tomate cherry, aceituna y lechuga',
                precio: 600,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'fosforitos',
                nombre: 'Fosforitos',
                descripcion: 'Jamón y queso',
                precio: 460,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'nuggets',
                nombre: 'Nuggets Crocantes',
                descripcion: 'Con 4 salsas',
                precio: null,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10,
                pendiente: true
            },
            {
                id: 'salchichas',
                nombre: 'Salchichas envueltas',
                descripcion: 'Con 4 salsas',
                precio: null,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10,
                pendiente: true
            }
        ],
        dulce: [
            {
                id: 'canastitas',
                nombre: 'Canastitas',
                descripcion: 'Relleno: crema, dulce de leche y mousse de chocolate',
                precio: 650,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'shots',
                nombre: 'Shots variados',
                descripcion: 'Variedad de sabores a elección',
                precio: 850,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'tacitas',
                nombre: 'Tacitas Rellenas',
                descripcion: 'Masa de hojadre con relleno de crema',
                precio: 700,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10
            },
            {
                id: 'conitos_dulces',
                nombre: 'Conitos Dulces',
                descripcion: 'Rellenos con: crema, dulce de leche, mousse de chocolate',
                precio: null,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10,
                pendiente: true
            },
            {
                id: 'galletas',
                nombre: 'Galletas Artesanales',
                descripcion: 'Veganas',
                precio: null,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10,
                pendiente: true
            },
            {
                id: 'donas',
                nombre: 'Mini Donas',
                descripcion: 'Bañadas en chocolate',
                precio: null,
                unidad: 'unidad',
                minimo: 50,
                incremento: 10,
                pendiente: true
            }
        ]
    }
};

const WHATSAPP_PHONE = CONFIG.whatsapp.phone;

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
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getAllProducts() {
    return [...CONFIG.productos.clasicos, ...CONFIG.productos.dulce];
}

function getProductById(id) {
    return getAllProducts().find(p => p.id === id);
}