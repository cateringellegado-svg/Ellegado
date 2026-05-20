const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

let supabase = null;
if (window.supabase) {
    try {
        if (SUPABASE_URL && SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_URL.startsWith('http')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn('Supabase URL no está configurada o es inválida en el administrador.');
        }
    } catch (err) {
        console.error('Error al inicializar el cliente de Supabase en el administrador:', err);
    }
}

const APP_CONFIG = {
    sitio: {
        nombre: 'El Legado - Catering y Eventos',
        url: 'https://www.ellegado.cl'
    },
    precios: {
        salado: 15000,
        dulce: 10000,
        staff: 6000,
        decor: 4000
    },
    invitados: {
        min: 20,
        max: 300,
        default: 50
    }
};

async function getAuthSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

async function checkAuth() {
    const session = await getAuthSession();
    if (!session) {
        window.location.href = 'login.html';
    }
    return session;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatCLP(value) {
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}