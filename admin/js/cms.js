// CMS Module - Admin Panel
// Handles site configuration management

let cmsInitialized = false;

async function loadCMS() {
    const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .order('key');
    
    if (error) {
        console.error('Error loading CMS config:', error);
        showNotification('Error cargando configuración del sitio', 'error');
        return;
    }
    
    const config = {};
    data.forEach(c => { config[c.key] = c.value; });
    
    loadCMSColors(config.colors || {});
    loadCMSContent(config);
    loadCMSImages(config);
    loadCMSSocial(config.social || {});
    loadCMSSections(config.sections || {});
}

function loadCMSColors(colors) {
    const fields = {
        'cms-color-primary': colors.primary || '#AF7A54',
        'cms-color-primary-light': colors.primaryLight || '#D9A78B',
        'cms-color-background': colors.background || '#FAF9F6',
        'cms-color-text': colors.text || '#1A1A1A',
        'cms-color-text-secondary': colors.textSecondary || '#64748B'
    };
    
    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }
}

function loadCMSContent(config) {
    // Hero
    const hero = config.hero || {};
    safeSetValue('cms-hero-title', hero.title || 'El Legado');
    safeSetValue('cms-hero-subtitle', hero.subtitle || 'Catering & Eventos');
    safeSetValue('cms-hero-tagline', hero.tagline || '');
    safeSetValue('cms-hero-cta', hero.ctaText || 'Cotizá tu evento');
    
    // About
    const about = config.about || {};
    safeSetValue('cms-about-title', about.title || 'Sobre Nosotros');
    safeSetValue('cms-about-text', about.text || '');
    safeSetValue('cms-about-highlight', about.highlight || '');
    
    // Festin
    const festin = config.festin || {};
    safeSetValue('cms-festin-title', festin.title || 'Armá tu Festín');
    safeSetValue('cms-festin-subtitle', festin.subtitle || '');
    safeSetValue('cms-festin-cta', festin.ctaText || 'Empezá a cotizar');
    
    // Footer
    const footer = config.footer || {};
    safeSetValue('cms-footer-text', footer.text || '');
    safeSetValue('cms-footer-copyright', footer.copyright || '');
    
    // Contact
    const contact = config.contact || {};
    safeSetValue('cms-contact-email', contact.email || '');
    safeSetValue('cms-contact-whatsapp', contact.whatsapp || '');
}

function loadCMSImages(config) {
    const fields = [
        { key: 'cms-img-hero', label: 'Imagen Hero' },
        { key: 'cms-img-about', label: 'Imagen About' },
        { key: 'cms-img-festin', label: 'Imagen Festín' },
        { key: 'cms-img-logo', label: 'Logo' },
        { key: 'cms-img-favicon', label: 'Favicon' }
    ];
    
    fields.forEach(f => {
        const preview = document.getElementById(f.key + '-preview');
        if (preview) {
            const url = config[f.key] || '';
            if (url) {
                preview.innerHTML = `<img src="${sanitizeHTML(url)}" class="w-full h-32 object-cover rounded-lg">`;
                preview.dataset.url = url;
            } else {
                preview.innerHTML = `<div class="text-center text-slate-500 py-4"><p class="text-sm">Sin imagen</p></div>`;
                delete preview.dataset.url;
            }
        }
    });
}

function loadCMSSocial(social) {
    safeSetValue('cms-social-instagram', social.instagram || '#');
    safeSetValue('cms-social-facebook', social.facebook || '#');
    safeSetValue('cms-social-tiktok', social.tiktok || '#');
}

function loadCMSSections(sections) {
    const toggles = [
        'cms-section-hero',
        'cms-section-about',
        'cms-section-festin',
        'cms-section-gallery',
        'cms-section-testimonials',
        'cms-section-contact',
        'cms-section-comingSoon',
        'cms-section-footer'
    ];
    
    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const key = id.replace('cms-section-', '');
            el.checked = sections[key] !== false;
        }
    });
}

function safeSetValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'email' || el.type === 'url' || el.type === 'tel') {
            el.value = value;
        }
    }
}

async function saveCMS() {
    const colors = {
        primary: document.getElementById('cms-color-primary')?.value || '#AF7A54',
        primaryLight: document.getElementById('cms-color-primary-light')?.value || '#D9A78B',
        background: document.getElementById('cms-color-background')?.value || '#FAF9F6',
        text: document.getElementById('cms-color-text')?.value || '#1A1A1A',
        textSecondary: document.getElementById('cms-color-text-secondary')?.value || '#64748B'
    };
    
    const hero = {
        title: document.getElementById('cms-hero-title')?.value || '',
        subtitle: document.getElementById('cms-hero-subtitle')?.value || '',
        tagline: document.getElementById('cms-hero-tagline')?.value || '',
        ctaText: document.getElementById('cms-hero-cta')?.value || ''
    };
    
    const about = {
        title: document.getElementById('cms-about-title')?.value || '',
        text: document.getElementById('cms-about-text')?.value || '',
        highlight: document.getElementById('cms-about-highlight')?.value || ''
    };
    
    const festin = {
        title: document.getElementById('cms-festin-title')?.value || '',
        subtitle: document.getElementById('cms-festin-subtitle')?.value || '',
        ctaText: document.getElementById('cms-festin-cta')?.value || ''
    };
    
    const footer = {
        text: document.getElementById('cms-footer-text')?.value || '',
        copyright: document.getElementById('cms-footer-copyright')?.value || ''
    };
    
    const social = {
        instagram: document.getElementById('cms-social-instagram')?.value || '#',
        facebook: document.getElementById('cms-social-facebook')?.value || '#',
        tiktok: document.getElementById('cms-social-tiktok')?.value || '#'
    };
    
    const contact = {
        email: document.getElementById('cms-contact-email')?.value || '',
        whatsapp: document.getElementById('cms-contact-whatsapp')?.value || ''
    };
    
    const sections = {
        hero: document.getElementById('cms-section-hero')?.checked !== false,
        about: document.getElementById('cms-section-about')?.checked !== false,
        festin: document.getElementById('cms-section-festin')?.checked !== false,
        gallery: document.getElementById('cms-section-gallery')?.checked !== false,
        testimonials: document.getElementById('cms-section-testimonials')?.checked !== false,
        contact: document.getElementById('cms-section-contact')?.checked !== false,
        comingSoon: document.getElementById('cms-section-comingSoon')?.checked !== false,
        footer: document.getElementById('cms-section-footer')?.checked !== false
    };
    
    const images = {};
    ['cms-img-hero', 'cms-img-about', 'cms-img-festin', 'cms-img-logo', 'cms-img-favicon'].forEach(key => {
        const preview = document.getElementById(key + '-preview');
        images[key] = preview?.dataset?.url || '';
    });
    
    const configs = [
        { key: 'colors', value: colors },
        { key: 'hero', value: hero },
        { key: 'about', value: about },
        { key: 'festin', value: festin },
        { key: 'footer', value: footer },
        { key: 'social', value: social },
        { key: 'contact', value: contact },
        { key: 'sections', value: sections },
        { key: 'images', value: images }
    ];
    
    let hasError = false;
    for (const cfg of configs) {
        const { error } = await supabase
            .from('site_config')
            .upsert({ key: cfg.key, value: cfg.value });
        if (error) {
            console.error(`Error saving ${cfg.key}:`, error);
            hasError = true;
        }
    }
    
    if (hasError) {
        showNotification('Error al guardar alguna configuración', 'error');
    } else {
        showNotification('Configuración del sitio guardada');
    }
}

async function handleCMSImageUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', async (e) => {
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
        
        preview.innerHTML = '<div class="flex items-center justify-center h-full"><div class="text-center"><div class="animate-spin w-6 h-6 border-2 border-brand-copper border-t-transparent rounded-full mx-auto mb-2"></div><p class="text-sm text-slate-500">Subiendo...</p></div></div>';
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${previewId}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('site-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
        if (error) {
            showNotification('Error al subir: ' + error.message, 'error');
            preview.innerHTML = '<div class="text-center text-slate-500 py-4"><p class="text-sm">Error al subir</p></div>';
            return;
        }
        
        const { data: { publicUrl } } = supabase.storage
            .from('site-images')
            .getPublicUrl(data.path);
        
        preview.innerHTML = `<img src="${publicUrl}" class="w-full h-32 object-cover rounded-lg">`;
        preview.dataset.url = publicUrl;
    });
}

function initCMS() {
    if (cmsInitialized) return;
    cmsInitialized = true;
    
    loadCMS();
    
    const saveBtn = document.getElementById('save-cms-config');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCMS);
    }
    
    handleCMSImageUpload('cms-img-hero-input', 'cms-img-hero-preview');
    handleCMSImageUpload('cms-img-about-input', 'cms-img-about-preview');
    handleCMSImageUpload('cms-img-festin-input', 'cms-img-festin-preview');
    handleCMSImageUpload('cms-img-logo-input', 'cms-img-logo-preview');
    handleCMSImageUpload('cms-img-favicon-input', 'cms-img-favicon-preview');
    
    // Color picker sync with readonly text
    const colorMap = {
        'cms-color-primary': 'cms-color-primary-text',
        'cms-color-primary-light': null,
        'cms-color-background': null,
        'cms-color-text': null,
        'cms-color-text-secondary': null
    };
    
    for (const [pickerId, textId] of Object.entries(colorMap)) {
        const picker = document.getElementById(pickerId);
        if (picker) {
            picker.addEventListener('input', (e) => {
                if (textId) {
                    const textEl = document.getElementById(textId);
                    if (textEl) textEl.value = e.target.value;
                }
                updateColorPreview();
            });
        }
    }
    
    // Also sync text inputs back to color pickers
    const textPickers = document.querySelectorAll('#cms-color-primary-text');
    textPickers.forEach(textEl => {
        textEl.addEventListener('input', (e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                const picker = document.getElementById('cms-color-primary');
                if (picker) picker.value = val;
                updateColorPreview();
            }
        });
    });
}

function updateColorPreview() {
    const preview = document.getElementById('cms-color-preview');
    if (!preview) return;
    const primary = document.getElementById('cms-color-primary')?.value || '#AF7A54';
    const bg = document.getElementById('cms-color-background')?.value || '#FAF9F6';
    const text = document.getElementById('cms-color-text')?.value || '#1A1A1A';
    preview.style.cssText = `background:${bg};color:${text};border-color:${primary}20;`;
    const title = preview.querySelector('.preview-title');
    const btn = preview.querySelector('.preview-btn');
    if (title) title.style.color = primary;
    if (btn) btn.style.background = primary;
}
