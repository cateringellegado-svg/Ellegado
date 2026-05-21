const SUPABASE_URL = 'https://nebstosmaahdbivndlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYnN0b3NtYWFoZGJpdm5kbHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDM1NzMsImV4cCI6MjA5NDg3OTU3M30.wGEwTshOJe2mSA-mg0dTmOd6nZz4JH0s9ZIA26TbVUI';

var supabase = window.supabaseClient || window.supabase || null;

if (!supabase) {
    (function initSupabase() {
        try {
            if (SUPABASE_URL && SUPABASE_URL !== 'TU_SUPABASE_URL' && SUPABASE_URL.startsWith('http')) {
                var lib = window.supabaseLib || window.supabase;
                if (lib && typeof lib.createClient === 'function') {
                    supabase = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    window.supabaseClient = supabase;
                    window.supabase = supabase;
                    console.log('Supabase client initialized');
                }
            }
        } catch (err) {
            console.error('Error initializing Supabase:', err);
        }
    })();
} else {
    console.log('Supabase client already initialized');
}

window.supabaseClient = supabase;

const APP_CONFIG = {
    sitio: {
        nombre: 'El Legado - Catering y Eventos',
        url: 'https://ellegado.vercel.app'
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
    var result = await supabase.auth.getSession();
    return result.data.session;
}

async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    var result = await supabase.auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    return result.data;
}

async function signOut() {
    if (!supabase) return;
    var result = await supabase.auth.signOut();
    if (result.error) throw result.error;
}

async function checkAuth() {
    var session = await getAuthSession();
    if (!session) {
        window.location.href = 'login.html';
    }
    return session;
}

function showNotification(message, type) {
    if (type === undefined) type = 'success';
    var existing = document.querySelector('.admin-notification');
    if (existing) existing.remove();
    
    var colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-brand-copper text-white'
    };
    
    var notification = document.createElement('div');
    notification.className = 'admin-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] transition-all duration-300 ' + (colors[type] || colors.success);
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function() { notification.remove(); }, 3000);
}

function formatCLP(value) {
    if (!value && value !== 0) return '$0';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    var date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'short',
        day: 'numeric' 
    });
}
