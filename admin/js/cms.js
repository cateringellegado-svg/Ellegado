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
    
    // Hero Stats
    const stats = hero.stats || [];
    if (stats[0]) {
        safeSetValue('cms-hero-stat1-value', stats[0].value || '');
        safeSetValue('cms-hero-stat1-label', stats[0].label || '');
    }
    if (stats[1]) {
        safeSetValue('cms-hero-stat2-value', stats[1].value || '');
        safeSetValue('cms-hero-stat2-label', stats[1].label || '');
    }
    if (stats[2]) {
        safeSetValue('cms-hero-stat3-value', stats[2].value || '');
        safeSetValue('cms-hero-stat3-label', stats[2].label || '');
    }
    
    // About
    const about = config.about || {};
    safeSetValue('cms-about-title', about.title || 'Nuestra Filosofía');
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
        { key: 'cms-img-about', label: 'Imagen Filosofía' },
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
    
    // Load gallery images
    for (let i = 1; i <= 6; i++) {
        const preview = document.getElementById(`cms-img-gallery-${i}-preview`);
        if (preview) {
            const url = config[`cms-img-gallery-${i}`] || '';
            if (url) {
                preview.innerHTML = `<img src="${sanitizeHTML(url)}" class="w-full h-full object-cover rounded-lg">`;
                preview.dataset.url = url;
            } else {
                preview.innerHTML = `<div class="text-center text-slate-500 py-2"><p class="text-xs">Sin imagen</p></div>`;
                delete preview.dataset.url;
            }
        }
    }
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
    // Sanitize all text inputs
    const sanitize = (val) => String(val || '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '').trim();
    const sanitizeUrl = (val) => {
        const url = String(val || '').trim();
        if (!url || url === '#') return url;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : '#';
        } catch {
            return '#';
        }
    };
    const sanitizeColor = (val) => {
        const color = String(val || '').trim();
        return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#AF7A54';
    };
    const sanitizePhone = (val) => String(val || '').replace(/[^\d+]/g, '').slice(0, 20);
    const sanitizeEmail = (val) => {
        const email = String(val || '').trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
    };
    
    const colors = {
        primary: sanitizeColor(document.getElementById('cms-color-primary')?.value),
        primaryLight: sanitizeColor(document.getElementById('cms-color-primary-light')?.value),
        background: sanitizeColor(document.getElementById('cms-color-background')?.value),
        text: sanitizeColor(document.getElementById('cms-color-text')?.value),
        textSecondary: sanitizeColor(document.getElementById('cms-color-text-secondary')?.value)
    };
    
    const hero = {
        title: sanitize(document.getElementById('cms-hero-title')?.value),
        subtitle: sanitize(document.getElementById('cms-hero-subtitle')?.value),
        tagline: sanitize(document.getElementById('cms-hero-tagline')?.value),
        ctaText: sanitize(document.getElementById('cms-hero-cta')?.value),
        stats: [
            { value: sanitize(document.getElementById('cms-hero-stat1-value')?.value), label: sanitize(document.getElementById('cms-hero-stat1-label')?.value) },
            { value: sanitize(document.getElementById('cms-hero-stat2-value')?.value), label: sanitize(document.getElementById('cms-hero-stat2-label')?.value) },
            { value: sanitize(document.getElementById('cms-hero-stat3-value')?.value), label: sanitize(document.getElementById('cms-hero-stat3-label')?.value) }
        ]
    };
    
    const about = {
        title: sanitize(document.getElementById('cms-about-title')?.value),
        text: sanitize(document.getElementById('cms-about-text')?.value),
        highlight: sanitize(document.getElementById('cms-about-highlight')?.value)
    };
    
    const festin = {
        title: sanitize(document.getElementById('cms-festin-title')?.value),
        subtitle: sanitize(document.getElementById('cms-festin-subtitle')?.value),
        ctaText: sanitize(document.getElementById('cms-festin-cta')?.value)
    };
    
    const footer = {
        text: sanitize(document.getElementById('cms-footer-text')?.value),
        copyright: sanitize(document.getElementById('cms-footer-copyright')?.value)
    };
    
    const social = {
        instagram: sanitizeUrl(document.getElementById('cms-social-instagram')?.value),
        facebook: sanitizeUrl(document.getElementById('cms-social-facebook')?.value),
        tiktok: sanitizeUrl(document.getElementById('cms-social-tiktok')?.value)
    };
    
    const contact = {
        email: sanitizeEmail(document.getElementById('cms-contact-email')?.value),
        whatsapp: sanitizePhone(document.getElementById('cms-contact-whatsapp')?.value)
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
    
    // Gallery images
    for (let i = 1; i <= 6; i++) {
        const preview = document.getElementById(`cms-img-gallery-${i}-preview`);
        images[`cms-img-gallery-${i}`] = preview?.dataset?.url || '';
    }
    
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
        
        preview.innerHTML = '<div class="flex items-center justify-center h-full"><div class="text-center"><div class="animate-spin w-6 h-6 border-2 border-brand-copper border-t-transparent rounded-full mx-auto mb-2"></div><p class="text-sm text-slate-500">Procesando...</p></div></div>';
        
        // Convert to WebP for better performance
        let uploadFile = file;
        let fileName = `${previewId}-${Date.now()}`;
        
        try {
            const webpBlob = await convertToWebP(file, 0.85);
            if (webpBlob) {
                uploadFile = webpBlob;
                fileName = `${fileName}.webp`;
            } else {
                // Fallback: keep original format
                const fileExt = file.name.split('.').pop();
                fileName = `${fileName}.${fileExt}`;
            }
        } catch (err) {
            console.warn('WebP conversion failed, using original:', err);
            const fileExt = file.name.split('.').pop();
            fileName = `${fileName}.${fileExt}`;
        }
        
        const { data, error } = await supabase.storage
            .from('site-images')
            .upload(fileName, uploadFile, { cacheControl: '3600', upsert: true, contentType: uploadFile.type });
        
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

// Convert image to WebP using Canvas API
function convertToWebP(file, quality = 0.85) {
    return new Promise((resolve) => {
        // Check if WebP is supported
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(null);
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/webp', quality);
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
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
    
    // Gallery image uploads
    for (let i = 1; i <= 6; i++) {
        handleCMSImageUpload(`cms-img-gallery-${i}-input`, `cms-img-gallery-${i}-preview`);
    }
    
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
