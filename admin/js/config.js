const SUPABASE_URL = 'https://nebstosmaahdbivndlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnN0b3NtYWFoZGJpdm5kbHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDM1NzMsImV4cCI6MjA5NDg3OTU3M30.wGEwTshOJe2mSA-mg0dTmOd6nZz4JH0s9ZIA26TbVUI';

let supabase = null;
if (typeof window !== 'undefined' && window.supabase) {
    try {
        if (SUPABASE_URL && SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_URL.startsWith('http')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Cliente de Supabase inicializado correctamente en admin');
        } else {
            console.warn('Supabase URL no está configurada o es inválida en el administrador.');
        }
    } catch (err) {
        console.error('Error al inicializar el cliente de Supabase en el administrador:', err);
    }
}

window.supabaseClient = supabase;

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
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase no inicializado');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function signOut() {
    if (!supabase) return;
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
    const existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `admin-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatCLP(value) {
    if (!value && value !== 0) return '$0';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'short',
        day: 'numeric' 
    });
}
