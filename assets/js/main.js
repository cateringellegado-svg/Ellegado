document.addEventListener('DOMContentLoaded', async () => {
    showLoadingState();
    await loadProductsFromDB();
    hideLoadingState();
    loadProductsToDOM();
    await loadSiteConfig();
    initBackToTop();
    initMobileMenu();
    initExperienceTabs();
    initCateringCotizador();
    initWhatsAppLinks();
    initScrollAnimations();
});

function showLoadingState() {
    ['productos-clasicos', 'productos-premium', 'productos-dulces'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="animate-pulse flex flex-col items-center gap-3"><div class="w-12 h-12 border-4 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin"></div><p class="text-slate-500 text-sm">Cargando productos...</p></div></div>';
        }
    });
}

function hideLoadingState() {
    // Loading state is replaced by loadProductsToDOM
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll, .fade-in, section').forEach(el => {
        if(el.tagName.toLowerCase() === 'section') {
            el.querySelectorAll('h2, p, .grid > div').forEach(child => observer.observe(child));
        } else {
            observer.observe(el);
        }
    });
}

let cotizacionSeleccion = (() => {
    try {
        return JSON.parse(localStorage.getItem('legado_cotizacion')) || {};
    } catch {
        return {};
    }
})();

function saveCotizacionToStorage() {
    try {
        localStorage.setItem('legado_cotizacion', JSON.stringify(cotizacionSeleccion));
    } catch {
        console.warn('No se pudo guardar la cotización en localStorage');
    }
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    const icons = {
        success: '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        error: '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        warning: '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
        info: '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };
    
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${colors[type]} transform translate-x-full transition-transform duration-300 max-w-sm`;
    toast.innerHTML = `${icons[type]}<p class="text-sm font-medium flex-1">${message}</p>`;
    
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initExperienceTabs() {
    const tabs = document.querySelectorAll('.exp-tab');
    const contents = document.querySelectorAll('.exp-content');
    
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const exp = tab.getAttribute('data-exp');
            
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-brand-copper', 'text-white', 'border-brand-copper');
                t.classList.add('border-brand-copper/20', 'text-dark-elegant', 'hover:text-brand-copper');
            });
            
            tab.classList.add('active', 'bg-brand-copper', 'text-white', 'border-brand-copper');
            tab.classList.remove('border-brand-copper/20', 'text-dark-elegant', 'hover:text-brand-copper');
            
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(`exp-${exp}`).classList.add('active');
        });
    });
}

function loadProductsToDOM() {
    const clasicosContainer = document.getElementById('productos-clasicos');
    const premiumContainer = document.getElementById('productos-premium');
    const dulcesContainer = document.getElementById('productos-dulces');
    
    if (!clasicosContainer || !dulcesContainer) {
        console.log('Contenedores no encontrados, reintentando...');
        let retries = 0;
        const maxRetries = 5;
        const retryInterval = setInterval(() => {
            retries++;
            const clasicos = document.getElementById('productos-clasicos');
            const dulces = document.getElementById('productos-dulces');
            if (clasicos && dulces || retries >= maxRetries) {
                clearInterval(retryInterval);
                if (clasicos && dulces) {
                    loadProductsToDOM();
                } else {
                    console.error('No se encontraron contenedores de productos después de', maxRetries, 'intentos');
                    ['productos-clasicos', 'productos-premium', 'productos-dulces'].forEach(id => {
                        const c = document.getElementById(id);
                        if (c) c.innerHTML = '<p class="col-span-full text-center text-slate-500 py-8">Error al cargar productos. Recargá la página.</p>';
                    });
                }
            }
        }, 300);
        return;
    }
    
    try {
        clasicosContainer.innerHTML = CONFIG.productos.clasicos.map(p => createProductCard(p)).join('');
        
        if (premiumContainer) {
            premiumContainer.innerHTML = CONFIG.productos.premium.map(p => createProductCard(p, false, true)).join('');
        }
        
        dulcesContainer.innerHTML = CONFIG.productos.dulce.map(p => createProductCard(p, true)).join('');
        
        for (const [id, data] of Object.entries(cotizacionSeleccion)) {
            const input = document.getElementById(`input-${id}`);
            if (input) {
                input.value = data.cantidad;
            }
        }
        updateCotizador();
        
        console.log('Productos cargados correctamente');
    } catch (err) {
        console.error('Error cargando productos:', err);
        ['productos-clasicos', 'productos-premium', 'productos-dulces'].forEach(id => {
            const c = document.getElementById(id);
            if (c) c.innerHTML = '<p class="col-span-full text-center text-slate-500 py-8">Error al cargar productos. Recargá la página.</p>';
        });
    }
}

function createProductCard(producto, esDulce = false, esPremium = false) {
    const precioMostrar = producto.precio ? formatARS(producto.precio) : 'Por definir';
    const disabled = producto.pendiente ? 'opacity-60 grayscale-[50%]' : '';
    const inputDisabled = producto.pendiente ? 'disabled' : '';
    const badge = producto.pendiente ? '<span class="absolute top-3 right-3 text-[10px] bg-amber-100/80 text-amber-700 px-3 py-1 rounded-full font-medium tracking-wider uppercase border border-amber-200 backdrop-blur-sm z-10">Próximamente</span>' : '';
    
    const imagenHTML = producto.imagen_url 
        ? `<div class="mb-3 rounded-xl overflow-hidden h-32 border border-brand-copper/5"><img src="${escapeAttr(producto.imagen_url)}" alt="${escapeAttr(producto.nombre)}" class="w-full h-full object-cover" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
        : '';
    
    const cardClass = esPremium 
        ? 'relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-brand-copper/20 hover:shadow-xl hover:-translate-y-1 hover:border-brand-copper/40 transition-all duration-300 flex flex-col h-full group'
        : `relative bg-white rounded-2xl border border-brand-copper/20 hover:shadow-xl hover:-translate-y-1 hover:border-brand-copper/40 transition-all duration-300 flex flex-col h-full group ${disabled}`;
    
    const textColor = esPremium ? 'text-slate-100' : 'text-dark-elegant';
    const descColor = esPremium ? 'text-slate-400' : 'text-slate-600';
    const iconBg = esPremium ? 'bg-brand-copper/20' : 'bg-cream';
    
    return `
        <div class="${cardClass}">
            ${badge}
            ${imagenHTML}
            <div class="p-5 flex flex-col flex-1">
                <div class="mb-3 flex gap-3 items-start">
                    <div class="p-2 ${iconBg} rounded-xl border border-brand-copper/5 group-hover:bg-brand-copper/5 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-brand-copper/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    </div>
                    <h4 class="font-serif text-lg ${textColor} font-medium leading-tight">${escapeAttr(producto.nombre)}</h4>
                </div>
                <p class="text-xs ${descColor} mb-5 flex-grow font-light leading-relaxed">${escapeAttr(producto.descripcion || '')}</p>
                
                <div class="flex justify-between items-end mt-auto pt-4 border-t border-brand-copper/5">
                    <div>
                        <span class="text-[9px] text-slate-600 font-medium uppercase tracking-widest block mb-1">Valor Unitario</span>
                        <span class="font-sans text-sm text-brand-copper font-bold">${precioMostrar}</span>
                    </div>
                    
                    ${producto.pendiente ? '' : `
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center bg-cream border border-brand-copper/20 rounded-lg overflow-hidden">
                            <button type="button" class="btn-restar px-2 py-1 text-brand-copper hover:bg-brand-copper/10 transition-colors" data-target="input-${producto.id}">−</button>
                            <input type="number" 
                                id="input-${producto.id}"
                                data-producto="${producto.id}" 
                                data-precio="${producto.precio || 0}"
                                data-nombre="${escapeAttr(producto.nombre)}"
                                min="${producto.minimo}"
                                step="${producto.incremento}"
                                class="w-12 text-center bg-transparent border-x border-brand-copper/10 py-1 text-sm font-medium text-dark-elegant focus:outline-none appearance-none"
                                placeholder="0" ${inputDisabled}>
                            <button type="button" class="btn-sumar px-2 py-1 text-brand-copper hover:bg-brand-copper/10 transition-colors" data-target="input-${producto.id}">+</button>
                        </div>
                        <span class="text-[9px] text-slate-600 italic">Mín: ${producto.minimo} / +${producto.incremento}</span>
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initCateringCotizador() {
    document.addEventListener('input', (e) => {
        if (e.target.dataset.producto) {
            handleInputUpdate(e.target);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-sumar')) {
            const input = document.getElementById(e.target.dataset.target);
            if (input && !input.disabled) {
                const min = parseInt(input.min) || 0;
                const step = parseInt(input.step) || 1;
                const current = parseInt(input.value) || 0;
                input.value = current === 0 ? min : current + step;
                handleInputUpdate(input);
            }
        }
        if (e.target.classList.contains('btn-restar')) {
            const input = document.getElementById(e.target.dataset.target);
            if (input && !input.disabled) {
                const min = parseInt(input.min) || 0;
                const step = parseInt(input.step) || 1;
                const current = parseInt(input.value) || 0;
                if (current > min) {
                    input.value = current - step;
                } else {
                    input.value = '';
                }
                handleInputUpdate(input);
            }
        }
    });

    function handleInputUpdate(target) {
        const productoId = target.dataset.producto;
        const cantidad = parseInt(target.value) || 0;
        const precio = parseInt(target.dataset.precio) || 0;
        
        if (cantidad > 0 && precio > 0) {
            cotizacionSeleccion[productoId] = {
                nombre: target.dataset.nombre,
                cantidad: cantidad,
                precio: precio,
                subtotal: cantidad * precio
            };
            const producto = getProductById(productoId);
            if (producto) {
                showToast(`${producto.nombre} agregado (${cantidad} u.)`, 'success');
            }
        } else {
            const prevData = cotizacionSeleccion[productoId];
            delete cotizacionSeleccion[productoId];
            if (prevData) {
                showToast(`${prevData.nombre} removido`, 'info');
            }
        }
        
        saveCotizacionToStorage();
        updateCotizador();
    }
    
    const cotizarBtn = document.getElementById('cotizar-btn');
    const modal = document.getElementById('modal-cotizacion');
    const formModal = document.getElementById('form-cotizacion');
    const closeModal = document.getElementById('close-modal-cotizacion');

    if (cotizarBtn && modal) {
        cotizarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Rate limiting: max 5 cotizations per hour
            const now = Date.now();
            let rateLimit = [];
            try {
                rateLimit = JSON.parse(localStorage.getItem('legado_rate_limit') || '[]');
            } catch {
                rateLimit = [];
            }
            const recentRequests = rateLimit.filter(t => now - t < 3600000);
            if (recentRequests.length >= 5) {
                showToast('Demasiadas solicitudes. Esperá unos minutos antes de intentar nuevamente.', 'warning');
                return;
            }
            
            const productosValidos = Object.values(cotizacionSeleccion).filter(p => p.cantidad > 0 && p.precio > 0);
            
            if (productosValidos.length === 0) {
                showToast('Por favor selecciona al menos un producto con cantidad válida', 'warning');
                return;
            }
            
            // Record this request
            recentRequests.push(now);
            try {
                localStorage.setItem('legado_rate_limit', JSON.stringify(recentRequests));
            } catch {}
            
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('div').classList.remove('scale-95');
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                modal.querySelector('div').classList.add('scale-95');
            });
        }

        if (formModal) {
            formModal.addEventListener('submit', async (e) => {
                e.preventDefault();
                const clienteNombre = document.getElementById('cot-nombre').value;
                const clienteTelefono = document.getElementById('cot-telefono').value;
                const clienteEmail = document.getElementById('cot-email').value;

                modal.classList.add('opacity-0', 'pointer-events-none');
                modal.querySelector('div').classList.add('scale-95');

                await enviarCotizacionWhatsApp(clienteNombre, clienteTelefono, clienteEmail);
            });
        }
    }
}

function updateCotizador() {
    const seleccionContainer = document.getElementById('cotizador-seleccion');
    const totalElement = document.getElementById('cotizador-total');
    const warningElement = document.getElementById('cotizador-warning');
    const cotizarBtn = document.getElementById('cotizar-btn');
    
    if (!seleccionContainer || !totalElement) return;
    
    const productos = Object.values(cotizacionSeleccion).filter(p => p.cantidad > 0 && p.precio > 0);
    
    if (productos.length === 0) {
        seleccionContainer.innerHTML = '<p class="text-slate-600 text-center py-4">Selecciona los productos arriba para agregar a tu cotización</p>';
        totalElement.textContent = '$0';
        if (warningElement) warningElement.classList.add('hidden');
        if (cotizarBtn) cotizarBtn.classList.remove('opacity-50', 'pointer-events-none');
        return;
    }
    
    // Detect category conflict: Clásica + Premium not allowed
    const categories = new Set();
    productos.forEach(p => {
        const cat = getProductCategory(p.id || '');
        if (cat) categories.add(cat);
    });
    
    const hasConflict = categories.has('clasica') && categories.has('premium');
    
    if (warningElement) {
        if (hasConflict) {
            warningElement.classList.remove('hidden');
        } else {
            warningElement.classList.add('hidden');
        }
    }
    
    if (cotizarBtn) {
        if (hasConflict) {
            cotizarBtn.classList.add('opacity-50', 'pointer-events-none');
        } else {
            cotizarBtn.classList.remove('opacity-50', 'pointer-events-none');
        }
    }
    
    seleccionContainer.innerHTML = productos.map(p => {
        const producto = getProductById(p.id || '');
        const thumb = producto?.imagen_url 
            ? `<img src="${escapeAttr(producto.imagen_url)}" alt="" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" onerror="this.style.display='none'">`
            : '';
        
        return `
        <div class="flex items-center gap-3 py-2 border-b border-brand-copper/5">
            ${thumb}
            <div class="flex-1 min-w-0">
                <span class="text-sm text-dark-elegant block truncate">${escapeAttr(p.nombre)}</span>
                <span class="text-xs text-slate-600">${p.cantidad} u. x ${formatARS(p.precio)}</span>
            </div>
            <span class="text-sm text-brand-copper font-medium flex-shrink-0">${formatARS(p.subtotal)}</span>
        </div>
    `}).join('');
    
    const total = productos.reduce((sum, p) => sum + p.subtotal, 0);
    totalElement.textContent = formatARS(total);
}

async function enviarCotizacionWhatsApp(clienteNombre = '', clienteTelefono = '', clienteEmail = '') {
    const productos = Object.values(cotizacionSeleccion).filter(p => p.cantidad > 0 && p.precio > 0);
    
    // Validate no Clásica + Premium conflict
    const categories = new Set();
    productos.forEach(p => {
        const cat = getProductCategory(p.id || '');
        if (cat) categories.add(cat);
    });
    
    if (categories.has('clasica') && categories.has('premium')) {
        showToast('No se pueden mezclar productos de Experiencia Clásica con Premium. Podés combinar Dulce con cualquiera de las dos.', 'error');
        return;
    }
    
    const total = productos.reduce((sum, p) => sum + p.subtotal, 0);
    
    let productosTexto = productos.map(p => 
        `• ${p.nombre}: ${p.cantidad} unidades (${formatARS(p.subtotal)})`
    ).join('\n');
    
    const totalFormat = formatARS(total);
    const mensajePersonal = `Mi nombre es ${clienteNombre}. Quedo atento a su respuesta para coordinar los detalles.`;
    const mensaje = CONFIG.whatsapp.messageTemplate(productosTexto, totalFormat, mensajePersonal);
    
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensaje)}`;
    
    const cotizacion = {
        total_unidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
        productos: productos.map(p => ({ nombre: p.nombre, cantidad: p.cantidad })),
        total: total,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cliente_email: clienteEmail
    };
    
    await guardarCotizacion(cotizacion);
    
    window.open(waUrl, '_blank');
}

function initWhatsAppLinks() {
    const whatsappButtons = document.querySelectorAll('[data-whatsapp]');
    
    if (!whatsappButtons.length) return;

    const defaultMessage = "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering.";
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(defaultMessage)}`;

    whatsappButtons.forEach(btn => {
        if (btn.tagName === 'A') {
            btn.setAttribute('href', url);
            btn.setAttribute('target', '_blank');
        } else if (btn.tagName === 'BUTTON') {
            btn.addEventListener('click', () => {
                window.open(url, '_blank', 'noopener,noreferrer');
            });
        }
    });
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 500) {
                    backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                    backToTopBtn.classList.add('opacity-100');
                } else {
                    backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                    backToTopBtn.classList.remove('opacity-100');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!menuBtn || !closeBtn || !mobileMenu) return;

    let lastFocusedElement = null;

    function toggleMenu() {
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            if (lastFocusedElement) lastFocusedElement.focus();
        } else {
            lastFocusedElement = document.activeElement;
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            document.body.classList.add('overflow-hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
            // Focus first link in menu
            const firstLink = mobileMenu.querySelector('.mobile-link');
            if (firstLink) firstLink.focus();
        }
    }

    // Focus trap
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu();
            return;
        }
        
        if (e.key === 'Tab') {
            const focusable = mobileMenu.querySelectorAll('a, button');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    menuBtn.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}
