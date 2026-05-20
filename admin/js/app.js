// SECURITY: Sanitización de HTML para prevenir XSS
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// SECURITY: Validación de entrada
function validateNumber(value, min, max) {
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max;
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initSessionMonitor();
    initNavigation();
    loadDashboard();
    loadCotizaciones();
    loadClientes();
    loadMenus();
    loadEventos();
    loadConfig();
    initLogout();
    initModal();
});

// SECURITY: Monitor de sesión
function initSessionMonitor() {
    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
    let lastActivity = Date.now();
    
    const resetActivity = () => { lastActivity = Date.now(); };
    
    document.addEventListener('click', resetActivity);
    document.addEventListener('keypress', resetActivity);
    document.addEventListener('scroll', resetActivity);
    
    setInterval(async () => {
        if (Date.now() - lastActivity > TIMEOUT_MS) {
            await signOut();
            showNotification('Sesión expirada por inactividad', 'error');
            window.location.href = 'login.html';
        }
    }, 60000);
}

function initNavigation() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.section');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            loadSectionData(sectionId);
        });
    });
    
    links[0].classList.add('active');
}

async function loadSectionData(section) {
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'cotizaciones': loadCotizaciones(); break;
        case 'clientes': loadClientes(); break;
        case 'menus': loadMenus(); break;
        case 'eventos': loadEventos(); break;
        case 'config': loadConfig(); break;
    }
}

async function loadDashboard() {
    const { data: cotizaciones } = await supabase
        .from('cotizaciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const { data: eventos } = await supabase
        .from('eventos')
        .select('*')
        .eq('estado', 'confirmado');

    const { data: clientes } = await supabase
        .from('clientes')
        .select('id');
    
    const { data: todasCotizaciones } = await supabase
        .from('cotizaciones')
        .select('presupuesto');

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthCotizaciones = todasCotizaciones?.filter(c => {
        const date = new Date(c.created_at);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }) || [];

    const totalIngresos = monthCotizaciones.reduce((sum, c) => sum + (c.presupuesto || 0), 0);

    document.getElementById('stat-cotizaciones').textContent = monthCotizaciones.length;
    document.getElementById('stat-eventos').textContent = eventos?.length || 0;
    document.getElementById('stat-clientes').textContent = clientes?.length || 0;
    document.getElementById('stat-ingresos').textContent = formatCLP(totalIngresos);

    const container = document.getElementById('recent-cotizaciones');
    if (cotizaciones && cotizaciones.length > 0) {
        container.innerHTML = cotizaciones.slice(0, 5).map(c => {
            const nombre = sanitizeHTML(c.cliente_nombre || 'Cliente sin nombre');
            const tipo = sanitizeHTML(c.tipo_evento);
            const estado = sanitizeHTML(c.estado);
            return `
            <div class="flex items-center justify-between p-4 bg-cream rounded-lg">
                <div>
                    <p class="font-medium text-dark-elegant">${nombre}</p>
                    <p class="text-sm text-slate-500">${tipo} - ${c.num_invitados} invitados</p>
                </div>
                <div class="text-right">
                    <p class="font-serif text-brand-copper">${formatCLP(c.presupuesto)}</p>
                    <span class="text-xs px-2 py-1 rounded-full ${getEstadoClass(estado)}">${estado}</span>
                </div>
            </div>
        `}).join('');
    } else {
        container.innerHTML = '<p class="text-slate-400 text-center py-4">No hay cotizaciones aún</p>';
    }
}

async function loadCotizaciones() {
    const filter = document.getElementById('filter-estado').value;
    let query = supabase.from('cotizaciones').select('*').order('created_at', { ascending: false });
    
    if (filter) {
        query = query.eq('estado', filter);
    }
    
    const { data, error } = await query;
    
    const tbody = document.getElementById('cotizaciones-table');
    if (error) {
        console.error('Error cargando cotizaciones:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">Error al cargar datos. Intenta más tarde.</td></tr>`;
        return;
    }
    
    if (data && data.length > 0) {
        tbody.innerHTML = data.map(c => {
            const nombre = sanitizeHTML(c.cliente_nombre || 'Sin nombre');
            const email = sanitizeHTML(c.cliente_email || '');
            const tipo = sanitizeHTML(c.tipo_evento);
            const estado = sanitizeHTML(c.estado);
            return `
            <tr class="hover:bg-cream/50 transition-colors">
                <td class="px-6 py-4 text-sm text-slate-600">${formatDate(c.created_at)}</td>
                <td class="px-6 py-4">
                    <p class="font-medium text-dark-elegant">${nombre}</p>
                    <p class="text-xs text-slate-400">${email}</p>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">${tipo}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${c.num_invitados}</td>
                <td class="px-6 py-4 font-medium text-brand-copper">${formatCLP(c.presupuesto)}</td>
                <td class="px-6 py-4">
                    <select onchange="updateEstado('${c.id}', this.value)" class="text-xs px-2 py-1 rounded-full border-0 ${getEstadoClass(estado)}">
                        <option value="nueva" ${c.estado === 'nueva' ? 'selected' : ''}>Nueva</option>
                        <option value="contactada" ${c.estado === 'contactada' ? 'selected' : ''}>Contactada</option>
                        <option value="confirmada" ${c.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="completada" ${c.estado === 'completada' ? 'selected' : ''}>Completada</option>
                    </select>
                </td>
                <td class="px-6 py-4">
                    <button onclick="viewCotizacion('${c.id}')" class="text-brand-copper hover:text-brand-copper-light">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `}).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400">No hay cotizaciones</td></tr>`;
    }
}

window.updateEstado = async function(id, estado) {
    const { error } = await supabase
        .from('cotizaciones')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', id);
    
    if (!error) {
        showNotification('Estado actualizado');
        loadCotizaciones();
    }
};

window.viewCotizacion = async function(id) {
    const { data } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', id)
        .single();
    
    if (!data) return;
    
    let servicios = [];
    try {
        servicios = typeof data.servicios === 'string' ? JSON.parse(data.servicios) : (data.servicios || []);
    } catch (e) { servicios = []; }
    
    const nombre = sanitizeHTML(data.cliente_nombre || 'No especificado');
    const email = sanitizeHTML(data.cliente_email || 'No especificado');
    const telefono = sanitizeHTML(data.cliente_telefono || 'No especificado');
    const tipo = sanitizeHTML(data.tipo_evento);
    
    document.getElementById('modal-title').textContent = `Cotización #${id.slice(0, 8)}`;
    document.getElementById('modal-content').innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-slate-400 uppercase">Cliente</p>
                    <p class="font-medium">${nombre}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-400 uppercase">Email</p>
                    <p class="font-medium">${email}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-400 uppercase">Teléfono</p>
                    <p class="font-medium">${telefono}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-400 uppercase">Tipo de Evento</p>
                    <p class="font-medium">${tipo}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-400 uppercase">Invitados</p>
                    <p class="font-medium">${data.num_invitados}</p>
                </div>
                <div>
                    <p class="text-xs text-slate-400 uppercase">Presupuesto</p>
                    <p class="font-medium text-brand-copper">${formatCLP(data.presupuesto)}</p>
                </div>
            </div>
            <div>
                <p class="text-xs text-slate-400 uppercase mb-2">Servicios</p>
                <div class="flex flex-wrap gap-2">
                    ${servicios.map(s => `<span class="px-3 py-1 bg-brand-copper/10 text-brand-copper rounded-full text-sm">${sanitizeHTML(s)}</span>`).join('')}
                </div>
            </div>
            <div class="pt-4 border-t border-brand-copper/10">
                <p class="text-xs text-slate-400">Creada: ${formatDate(data.created_at)}</p>
            </div>
        </div>
    `;
    document.getElementById('modal').classList.remove('hidden');
};

async function loadClientes() {
    const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
    
    const tbody = document.getElementById('clientes-table');
    if (data && data.length > 0) {
        tbody.innerHTML = data.map(c => {
            const nombre = sanitizeHTML(c.nombre);
            const email = sanitizeHTML(c.email || '-');
            const telefono = sanitizeHTML(c.telefono || '-');
            return `
            <tr class="hover:bg-cream/50 transition-colors">
                <td class="px-6 py-4 font-medium text-dark-elegant">${nombre}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${email}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${telefono}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${c.eventos_count || 0}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${c.created_at ? formatDate(c.created_at) : '-'}</td>
            </tr>
        `}).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400">No hay clientes</td></tr>`;
    }
}

async function loadMenus() {
    const { data: salados } = await supabase
        .from('menu_items')
        .select('*')
        .eq('categoria', 'salado')
        .order('orden');
    
    const { data: dulces } = await supabase
        .from('menu_items')
        .select('*')
        .eq('categoria', 'dulce')
        .order('orden');
    
    const saladosContainer = document.getElementById('menu-salados');
    const dulcesContainer = document.getElementById('menu-dulces');
    
    if (salados && salados.length > 0) {
        saladosContainer.innerHTML = salados.map(item => createMenuItemHTML(item)).join('');
    } else {
        saladosContainer.innerHTML = '<p class="text-slate-400 text-sm">No hay items. Agrega desde Supabase.</p>';
    }
    
    if (dulces && dulces.length > 0) {
        dulcesContainer.innerHTML = dulces.map(item => createMenuItemHTML(item)).join('');
    } else {
        dulcesContainer.innerHTML = '<p class="text-slate-400 text-sm">No hay items. Agrega desde Supabase.</p>';
    }
}

function createMenuItemHTML(item) {
    const nombre = sanitizeHTML(item.nombre);
    const etiquetas = item.etiquetas ? item.etiquetas.map(e => 
        `<span class="text-[10px] px-2 py-0.5 bg-brand-copper/10 text-brand-copper rounded-full">${sanitizeHTML(e)}</span>`
    ).join('') : '';
    
    return `
        <div class="flex items-center justify-between p-3 bg-cream rounded-lg">
            <div>
                <p class="font-medium text-dark-elegant">${nombre}</p>
                <div class="flex gap-1 mt-1">${etiquetas}</div>
            </div>
            <div class="text-right">
                <p class="font-medium text-brand-copper">${formatCLP(item.precio)}</p>
                <button onclick="toggleMenuItem('${item.id}', ${!item.activo})" class="text-xs ${item.activo ? 'text-green-600' : 'text-red-500'}">
                    ${item.activo ? 'Activo' : 'Inactivo'}
                </button>
            </div>
        </div>
    `;
}

window.toggleMenuItem = async function(id, activo) {
    await supabase
        .from('menu_items')
        .update({ activo })
        .eq('id', id);
    
    loadMenus();
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

async function loadEventos() {
    const { data: eventos } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha');
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('current-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let html = days.map(d => `<div class="text-center text-xs font-medium text-slate-400 py-2">${d}</div>`).join('');
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="p-2"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEventos = eventos?.filter(e => e.fecha === dateStr) || [];
        
        html += `
            <div class="p-2 text-center ${dayEventos.length > 0 ? 'bg-brand-copper/10 rounded-lg' : ''}">
                <p class="text-sm ${dayEventos.length > 0 ? 'font-medium text-brand-copper' : 'text-slate-600'}">${day}</p>
                ${dayEventos.length > 0 ? `<p class="text-[10px] text-slate-500">${dayEventos.length} evento(s)</p>` : ''}
            </div>
        `;
    }
    
    document.getElementById('calendar-grid').innerHTML = html;
}

document.getElementById('prev-month')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    loadEventos();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    loadEventos();
});

async function loadConfig() {
    const { data } = await supabase
        .from('config')
        .select('*');
    
    if (data) {
        const config = {};
        data.forEach(c => { config[c.key] = c.value; });
        
        if (config.precios) {
            document.getElementById('config-salado').value = config.precios.salado || 15000;
            document.getElementById('config-dulce').value = config.precios.dulce || 10000;
            document.getElementById('config-staff').value = config.precios.staff || 6000;
            document.getElementById('config-decor').value = config.precios.decor || 4000;
        }
        
        if (config.whatsapp) {
            document.getElementById('config-whatsapp').value = config.whatsapp.phone || '';
        }
        
        if (config.invitados) {
            document.getElementById('config-min').value = config.invitados.min || 20;
            document.getElementById('config-max').value = config.invitados.max || 300;
        }
    }
}

document.getElementById('save-config')?.addEventListener('click', async () => {
    const salado = parseInt(document.getElementById('config-salado').value);
    const dulce = parseInt(document.getElementById('config-dulce').value);
    const staff = parseInt(document.getElementById('config-staff').value);
    const decor = parseInt(document.getElementById('config-decor').value);
    const whatsapp = document.getElementById('config-whatsapp').value.replace(/\D/g, '');
    const minInvitados = parseInt(document.getElementById('config-min').value);
    const maxInvitados = parseInt(document.getElementById('config-max').value);
    
    if (!validateNumber(salado, 1000, 200000)) {
        showNotification('Precio de salado inválido (1.000 - 200.000)', 'error');
        return;
    }
    if (!validateNumber(dulce, 1000, 200000)) {
        showNotification('Precio de dulce inválido (1.000 - 200.000)', 'error');
        return;
    }
    if (!validateNumber(staff, 0, 100000)) {
        showNotification('Precio de staff inválido', 'error');
        return;
    }
    if (!validateNumber(decor, 0, 100000)) {
        showNotification('Precio de decoración inválido', 'error');
        return;
    }
    if (!validateNumber(minInvitados, 1, 1000) || !validateNumber(maxInvitados, 1, 1000)) {
        showNotification('Rango de invitados inválido', 'error');
        return;
    }
    if (minInvitados > maxInvitados) {
        showNotification('El mínimo no puede ser mayor que el máximo', 'error');
        return;
    }
    
    const precios = { salado, dulce, staff, decor };
    const whatsappConfig = { phone: whatsapp };
    const invitados = { min: minInvitados, max: maxInvitados };
    
    await supabase.from('config').upsert({ key: 'precios', value: precios });
    await supabase.from('config').upsert({ key: 'whatsapp', value: whatsappConfig });
    await supabase.from('config').upsert({ key: 'invitados', value: invitados });
    
    showNotification('Configuración guardada');
});

document.getElementById('filter-estado')?.addEventListener('change', loadCotizaciones);

function initModal() {
    document.getElementById('close-modal')?.addEventListener('click', () => {
        document.getElementById('modal').classList.add('hidden');
    });
    
    document.getElementById('modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            document.getElementById('modal').classList.add('hidden');
        }
    });
}

function initLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await signOut();
        window.location.href = 'login.html';
    });
}

function getEstadoClass(estado) {
    const classes = {
        'nueva': 'bg-blue-100 text-blue-700',
        'contactada': 'bg-yellow-100 text-yellow-700',
        'confirmada': 'bg-green-100 text-green-700',
        'completada': 'bg-slate-100 text-slate-700'
    };
    return classes[estado] || 'bg-slate-100 text-slate-700';
}

function formatCLP(value) {
    if (!value) return '$0';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
}