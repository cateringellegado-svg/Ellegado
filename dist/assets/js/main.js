document.addEventListener('DOMContentLoaded', () => {
    initBackToTop();
    initMobileMenu();
    initMenuFilter();
    initBudgetCalculator();
    initWhatsAppLinks();
    loadDynamicMenu();
});

function initWhatsAppLinks() {
    const whatsappLinks = document.querySelectorAll('[data-whatsapp]');
    
    if (!whatsappLinks.length) return;

    const defaultMessage = "Hola El Legado, me gustaría obtener más información sobre sus servicios de catering.";
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(defaultMessage)}`;

    whatsappLinks.forEach(link => {
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
    });
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.add('opacity-100');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.remove('opacity-100');
        }
    });

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

    function toggleMenu() {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
        document.body.classList.toggle('overflow-hidden');
    }

    menuBtn.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}

function initMenuFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    if (!filterBtns.length || !menuItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-brand-copper', 'text-white', 'border-brand-copper');
                b.classList.add('border-brand-copper/20', 'text-dark-elegant', 'hover:text-brand-copper');
                b.setAttribute('aria-pressed', 'false');
            });

            btn.classList.add('active', 'bg-brand-copper', 'text-white', 'border-brand-copper');
            btn.classList.remove('border-brand-copper/20', 'text-dark-elegant', 'hover:text-brand-copper');
            btn.setAttribute('aria-pressed', 'true');

            const filter = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');
                const diets = item.getAttribute('data-diet') ? item.getAttribute('data-diet').split(' ') : [];

                let isMatch = false;

                if (filter === 'all') {
                    isMatch = true;
                } else if (filter === 'salado' || filter === 'dulce') {
                    isMatch = (category === filter);
                } else {
                    isMatch = diets.includes(filter);
                }

                if (isMatch) {
                    item.classList.remove('filtered-out');
                } else {
                    item.classList.add('filtered-out');
                }
            });
        });
    });
}

function initBudgetCalculator() {
    const eventTypeSelect = document.getElementById('event-type');
    const guestsRange = document.getElementById('guests-range');
    const guestsValue = document.getElementById('guests-value');
    const serviceSalado = document.getElementById('service-salado');
    const serviceDulce = document.getElementById('service-dulce');
    const serviceStaff = document.getElementById('service-staff');
    const serviceDecor = document.getElementById('service-decor');
    const budgetRangeDiv = document.getElementById('budget-range');
    const whatsappCotizarBtn = document.getElementById('whatsapp-cotizar-btn');

    if (!guestsRange) return;

    function formatCLP(value) {
        return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function calculateBudget() {
        const guests = parseInt(guestsRange.value);
        if (guestsValue) guestsValue.textContent = guests;

        let pricePerPerson = 0;

        if (serviceSalado && serviceSalado.checked) pricePerPerson += PRICES.salado;
        if (serviceDulce && serviceDulce.checked) pricePerPerson += PRICES.dulce;
        if (serviceStaff && serviceStaff.checked) pricePerPerson += PRICES.staff;
        if (serviceDecor && serviceDecor.checked) pricePerPerson += PRICES.decor;

        const baseTotal = pricePerPerson * guests;

        if (baseTotal === 0) {
            if (budgetRangeDiv) budgetRangeDiv.textContent = "$0";
            if (whatsappCotizarBtn) {
                whatsappCotizarBtn.setAttribute('href', '#');
                whatsappCotizarBtn.classList.add('opacity-50', 'pointer-events-none');
            }
            return;
        }

        if (whatsappCotizarBtn) {
            whatsappCotizarBtn.classList.remove('opacity-50', 'pointer-events-none');
        }

        let low = Math.round((baseTotal * 0.95) / 1000) * 1000;
        let high = Math.round((baseTotal * 1.05) / 1000) * 1000;

        if (budgetRangeDiv) budgetRangeDiv.textContent = formatCLP(low) + ' - ' + formatCLP(high);

        const eventType = eventTypeSelect ? eventTypeSelect.value : "Evento";
        let servicesList = [];
        if (serviceSalado && serviceSalado.checked) servicesList.push("Bocados Salados");
        if (serviceDulce && serviceDulce.checked) servicesList.push("Variedad Dulce");
        if (serviceStaff && serviceStaff.checked) servicesList.push("Vajilla y Garzones");
        if (serviceDecor && serviceDecor.checked) servicesList.push("Decoración y Montaje");

        const budgetText = formatCLP(low) + ' - ' + formatCLP(high);
        const message = CONFIG.whatsapp.messageTemplate(eventType, guests, servicesList, budgetText);
        
        if (whatsappCotizarBtn) {
            const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
            whatsappCotizarBtn.setAttribute('href', waUrl);
            
            whatsappCotizarBtn.onclick = async (e) => {
                e.preventDefault();
                
                const cotizacion = {
                    tipo_evento: eventType,
                    num_invitados: guests,
                    servicios: servicesList,
                    presupuesto: Math.round((low + high) / 2),
                    presupuesto_low: low,
                    presupuesto_high: high
                };
                
                await guardarCotizacion(cotizacion);
                
                window.open(waUrl, '_blank');
            };
        }
    }

    guestsRange.addEventListener('input', calculateBudget);
    if (eventTypeSelect) eventTypeSelect.addEventListener('change', calculateBudget);
    [serviceSalado, serviceDulce, serviceStaff, serviceDecor].forEach(chk => {
        if (chk) chk.addEventListener('change', calculateBudget);
    });

    calculateBudget();
}

async function loadDynamicMenu() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient || typeof SUPABASE_URL === 'undefined' || SUPABASE_URL === 'TU_SUPABASE_URL') {
        console.log('Supabase client is not configured. Falling back to static HTML menu.');
        return;
    }

    const saladosList = document.getElementById('menu-salado-list');
    const dulcesList = document.getElementById('menu-dulce-list');

    if (!saladosList && !dulcesList) return;

    try {
        const { data: items, error } = await supabaseClient
            .from('menu_items')
            .select('*')
            .eq('activo', true)
            .order('orden', { ascending: true });

        if (error) throw error;

        if (items && items.length) {
            const saladosItems = items.filter(item => item.categoria === 'salado');
            const dulcesItems = items.filter(item => item.categoria === 'dulce');

            if (saladosList && saladosItems.length) {
                saladosList.innerHTML = '';
                saladosItems.forEach(item => {
                    saladosList.appendChild(renderMenuItem(item));
                });
            }

            if (dulcesList && dulcesItems.length) {
                dulcesList.innerHTML = '';
                dulcesItems.forEach(item => {
                    dulcesList.appendChild(renderMenuItem(item));
                });
            }
            
            console.log('Dynamic menu loaded successfully from Supabase.');
        }
    } catch (err) {
        console.error('Error fetching dynamic menu items from Supabase, keeping static menu fallback:', err);
    }
}

function renderMenuItem(item) {
    const li = document.createElement('li');
    li.className = "menu-item menu-item-transition border-b border-brand-copper/5 pb-2 flex justify-between items-center";
    li.setAttribute('data-category', item.categoria);
    
    let diets = [];
    let badgeText = [];
    if (item.etiquetas && item.etiquetas.length) {
        item.etiquetas.forEach(tag => {
            if (tag.toLowerCase() === 'vegano' || tag.toLowerCase() === 'vegan') {
                diets.push('vegan');
                badgeText.push('Vegano');
            }
            if (tag.toLowerCase() === 'gluten-free' || tag.toLowerCase() === 'sin-gluten') {
                diets.push('gluten-free');
                badgeText.push('Sin Gluten');
            }
        });
    }
    
    li.setAttribute('data-diet', diets.join(' '));
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.nombre;
    li.appendChild(nameSpan);
    
    if (badgeText.length) {
        const badgeSpan = document.createElement('span');
        badgeSpan.className = "text-[9px] font-sans font-medium text-brand-copper-light bg-brand-copper/5 px-2 py-0.5 rounded-full tracking-wider uppercase";
        badgeSpan.textContent = badgeText.join(' • ');
        li.appendChild(badgeSpan);
    }
    
    return li;
}