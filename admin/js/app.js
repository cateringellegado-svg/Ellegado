function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
    loadConfig();
    initLogout();
    initModal();
    initMenuCRUD();
});

function initSessionMonitor() {
    const TIMEOUT_MS = 15 * 60 * 1000;
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
            const target = document.getElementById(sectionId);
            if (target) target.classList.add('active');
            
            loadSectionData(sectionId);
        });
    });
    
    if (links.length > 0) links[0].classList.add('active');
}

async function loadSectionData(section) {
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'cotizaciones': loadCotizaciones(); break;
        case 'clientes': loadClientes(); break;
        case 'menus': loadMenus(); break;
        case 'config': loadConfig(); break;
    }
}

async function loadDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data: monthCotizaciones, error: err1 } = await supabase
        .from('cotizaciones')
        .select('presupuesto')
        .gte('created_at', startOfMonth);
    
    const { data: eventos, error: err2 } = await supabase
        .from('eventos')
        .select('id')
        .eq('estado', 'confirmado');

    const { data: clientes, error: err3 } = await supabase
        .from('clientes')
        .select('id', { count: 'exact', head: true });
    
    const { data: recentCotizaciones, error: err4 } = await supabase
        .from('cotizaciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (err1 || err2 || err3 || err4) {
        console.error('Error cargando dashboard:', err1, err2, err3, err4);
    }

    const totalIngresos = (monthCotizaciones || []).reduce((sum, c) => sum + (c.presupuesto || 0), 0);

    document.getElementById('stat-cotizaciones').textContent = (monthCotizaciones || []).length;
    document.getElementById('stat-eventos').textContent = (eventos || []).length;
    document.getElementById('stat-clientes').textContent = clientes || 0;
    document.getElementById('stat-ingresos').textContent = formatCLP(totalIngresos);

    const container = document.getElementById('recent-cotizaciones');
    if (recentCotizaciones && recentCotizaciones.length > 0) {
        container.innerHTML = recentCotizaciones.map(c => {
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
    const filter = document.getElementById('filter-estado')?.value;
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
    
    if (error) {
        showNotification('Error al actualizar estado', 'error');
        console.error('Error updateEstado:', error);
    } else {
        showNotification('Estado actualizado');
        loadCotizaciones();
    }
};

window.viewCotizacion = async function(id) {
    const { data, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) return;
    
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
                    ${servicios.map(s => `<span class="px-3 py-1 bg-brand-copper/10 text-brand-copper rounded-full text-sm">${sanitizeHTML(s.nombre || s)}</span>`).join('')}
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
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
    
    const tbody = document.getElementById('clientes-table');
    if (error) {
        console.error('Error cargando clientes:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500">Error al cargar datos</td></tr>`;
        return;
    }
    
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
    const { data: clasica, error: err1 } = await supabase
        .from('menu_items')
        .select('*')
        .eq('categoria', 'clasica')
        .order('orden');
    
    const { data: premium, error: err2 } = await supabase
        .from('menu_items')
        .select('*')
        .eq('categoria', 'premium')
        .order('orden');
    
    const { data: dulce, error: err3 } = await supabase
        .from('menu_items')
        .select('*')
        .eq('categoria', 'dulce')
        .order('orden');
    
    if (err1 || err2 || err3) {
        console.error('Error cargando menús:', err1, err2, err3);
        return;
    }
    
    const clasicaContainer = document.getElementById('menu-clasica');
    const premiumContainer = document.getElementById('menu-premium');
    const dulceContainer = document.getElementById('menu-dulce');
    
    if (clasicaContainer) {
        clasicaContainer.innerHTML = (clasica && clasica.length > 0) 
            ? clasica.map(item => createMenuItemHTML(item)).join('')
            : '<p class="text-slate-400 text-sm text-center py-4">No hay items. Usa "+ Agregar Item" para crear uno.</p>';
    }
    
    if (premiumContainer) {
        premiumContainer.innerHTML = (premium && premium.length > 0) 
            ? premium.map(item => createMenuItemHTML(item)).join('')
            : '<p class="text-slate-400 text-sm text-center py-4">No hay items. Usa "+ Agregar Item" para crear uno.</p>';
    }
    
    if (dulceContainer) {
        dulceContainer.innerHTML = (dulce && dulce.length > 0) 
            ? dulce.map(item => createMenuItemHTML(item)).join('')
            : '<p class="text-slate-400 text-sm text-center py-4">No hay items. Usa "+ Agregar Item" para crear uno.</p>';
    }
}

function createMenuItemHTML(item) {
    const nombre = sanitizeHTML(item.nombre);
    const descripcion = sanitizeHTML(item.descripcion || '');
    const precio = item.precio > 0 ? formatCLP(item.precio) : 'Por definir';
    const imagen = item.imagen_url ? `<img src="${sanitizeHTML(item.imagen_url)}" alt="${nombre}" class="w-16 h-16 object-cover rounded-lg border border-brand-copper/10" onerror="this.style.display='none'">` : `<div class="w-16 h-16 bg-cream rounded-lg border border-brand-copper/10 flex items-center justify-center"><svg class="w-8 h-8 text-brand-copper/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
    const etiquetas = item.etiquetas ? item.etiquetas.map(e => 
        `<span class="text-[10px] px-2 py-0.5 bg-brand-copper/10 text-brand-copper rounded-full">${sanitizeHTML(e)}</span>`
    ).join('') : '';
    
    return `
        <div class="flex items-start gap-4 p-4 bg-cream rounded-lg group hover:shadow-md transition-all" data-id="${item.id}">
            ${imagen}
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <p class="font-medium text-dark-elegant truncate">${nombre}</p>
                    <div class="flex gap-1 ml-2">
                        <button onclick="editMenuItem('${item.id}')" class="p-1 text-slate-400 hover:text-brand-copper transition-colors" title="Editar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onclick="deleteMenuItem('${item.id}', '${escapeAttr(nombre)}')" class="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
                ${descripcion ? `<p class="text-xs text-slate-500 line-clamp-2 mb-2">${descripcion}</p>` : ''}
                <div class="flex gap-1 mb-2">${etiquetas}</div>
            </div>
            <div class="text-right flex-shrink-0">
                <p class="font-medium text-brand-copper">${precio}</p>
                <button onclick="toggleMenuItem('${item.id}', ${!item.activo})" class="text-xs ${item.activo ? 'text-green-600' : 'text-red-500'} mt-1">
                    ${item.activo ? 'Activo' : 'Inactivo'}
                </button>
                ${item.pendiente ? '<p class="text-[10px] text-amber-500 mt-1">Pendiente</p>' : ''}
            </div>
        </div>
    `;
}

window.toggleMenuItem = async function(id, activo) {
    const { error } = await supabase
        .from('menu_items')
        .update({ activo })
        .eq('id', id);
    
    if (error) {
        showNotification('Error al actualizar', 'error');
    } else {
        loadMenus();
    }
};

let currentEditingItem = null;

function initMenuCRUD() {
    const addBtn = document.getElementById('add-menu-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openMenuModal());
    }
    
    const closeBtn = document.getElementById('close-menu-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenuModal);
    }
    
    const cancelBtn = document.getElementById('cancel-menu-modal');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeMenuModal);
    }
    
    const saveBtn = document.getElementById('save-menu-item');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveMenuItem);
    }
    
    const imageInput = document.getElementById('menu-image-input');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
}

function openMenuModal(item = null) {
    currentEditingItem = item;
    const modal = document.getElementById('menu-modal');
    const title = document.getElementById('menu-modal-title');
    
    if (item) {
        title.textContent = 'Editar Item';
        document.getElementById('menu-nombre').value = item.nombre || '';
        document.getElementById('menu-categoria').value = item.categoria || 'salado';
        document.getElementById('menu-precio').value = item.precio || 0;
        document.getElementById('menu-descripcion').value = item.descripcion || '';
        document.getElementById('menu-etiquetas').value = (item.etiquetas || []).join(', ');
        document.getElementById('menu-orden').value = item.orden || 0;
        document.getElementById('menu-minimo').value = item.minimo || 50;
        document.getElementById('menu-incremento').value = item.incremento || 10;
        document.getElementById('menu-activo').checked = item.activo !== false;
        document.getElementById('menu-pendiente').checked = item.pendiente || false;
        
        if (item.imagen_url) {
            document.getElementById('menu-image-preview').innerHTML = `<img src="${sanitizeHTML(item.imagen_url)}" class="w-full h-32 object-cover rounded-lg" onerror="this.style.display='none'">`;
        } else {
            document.getElementById('menu-image-preview').innerHTML = '';
        }
    } else {
        title.textContent = 'Agregar Item';
        document.getElementById('menu-form').reset();
        document.getElementById('menu-image-preview').innerHTML = '';
    }
    
    modal?.classList.remove('hidden');
}

function closeMenuModal() {
    document.getElementById('menu-modal')?.classList.add('hidden');
    currentEditingItem = null;
}

window.editMenuItem = async function(id) {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        showNotification('Error al cargar item', 'error');
        return;
    }
    
    openMenuModal(data);
};

window.deleteMenuItem = async function(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
    
    if (error) {
        showNotification('Error al eliminar', 'error');
        console.error('Error deleteMenuItem:', error);
    } else {
        showNotification('Item eliminado');
        loadMenus();
    }
};

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Solo se permiten imágenes', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    const preview = document.getElementById('menu-image-preview');
    preview.innerHTML = '<p class="text-sm text-slate-400">Subiendo...</p>';
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
    
    if (error) {
        showNotification('Error al subir imagen: ' + error.message, 'error');
        preview.innerHTML = '';
        return;
    }
    
    const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(data.path);
    
    preview.innerHTML = `<img src="${publicUrl}" class="w-full h-32 object-cover rounded-lg">`;
    preview.dataset.url = publicUrl;
}

async function saveMenuItem() {
    const nombre = document.getElementById('menu-nombre').value.trim();
    const categoria = document.getElementById('menu-categoria').value;
    const precio = parseInt(document.getElementById('menu-precio').value) || 0;
    const descripcion = document.getElementById('menu-descripcion').value.trim();
    const etiquetasStr = document.getElementById('menu-etiquetas').value.trim();
    const orden = parseInt(document.getElementById('menu-orden').value) || 0;
    const minimo = parseInt(document.getElementById('menu-minimo').value) || 50;
    const incremento = parseInt(document.getElementById('menu-incremento').value) || 10;
    const activo = document.getElementById('menu-activo').checked;
    const pendiente = document.getElementById('menu-pendiente').checked;
    
    if (!validateRequired(nombre)) {
        showNotification('El nombre es obligatorio', 'error');
        return;
    }
    
    if (!validateNumber(precio, 0, 1000000)) {
        showNotification('Precio inválido (0 - 1.000.000)', 'error');
        return;
    }
    
    const etiquetas = etiquetasStr ? etiquetasStr.split(',').map(e => e.trim()).filter(e => e) : [];
    const imagen_url = document.getElementById('menu-image-preview').dataset.url || '';
    
    const itemData = {
        nombre,
        categoria,
        precio,
        descripcion,
        etiquetas,
        orden,
        minimo,
        incremento,
        activo,
        pendiente,
        imagen_url
    };
    
    let error;
    if (currentEditingItem) {
        const result = await supabase
            .from('menu_items')
            .update(itemData)
            .eq('id', currentEditingItem.id);
        error = result.error;
    } else {
        const result = await supabase
            .from('menu_items')
            .insert([itemData]);
        error = result.error;
    }
    
    if (error) {
        showNotification('Error al guardar: ' + error.message, 'error');
        console.error('Error saveMenuItem:', error);
    } else {
        showNotification(currentEditingItem ? 'Item actualizado' : 'Item creado');
        closeMenuModal();
        loadMenus();
    }
}

async function loadConfig() {
    const { data, error } = await supabase
        .from('config')
        .select('*');
    
    if (error) {
        console.error('Error cargando configuración:', error);
        return;
    }
    
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
    
    const { error: err1 } = await supabase.from('config').upsert({ key: 'precios', value: precios });
    const { error: err2 } = await supabase.from('config').upsert({ key: 'whatsapp', value: whatsappConfig });
    const { error: err3 } = await supabase.from('config').upsert({ key: 'invitados', value: invitados });
    
    if (err1 || err2 || err3) {
        showNotification('Error al guardar configuración', 'error');
        console.error('Error save-config:', err1, err2, err3);
    } else {
        showNotification('Configuración guardada');
    }
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
    if (!value && value !== 0) return '$0';
    return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
}
