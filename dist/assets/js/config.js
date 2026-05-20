const CONFIG = {
    whatsapp: {
        phone: 'tu-numero-aqui',
        messageTemplate: (eventType, guests, services, budget) => 
            `Hola El Legado, me gustaría solicitar una cotización formal para un *${eventType}* para *${guests}* personas.\n\n*Servicios seleccionados:*\n- ${services.join('\n- ')}\n\n*Presupuesto aproximado:* ${budget}\n\nQuedo atento a su respuesta para coordinar los detalles.`
    },
    prices: {
        salado: 15000,
        dulce: 10000,
        staff: 6000,
        decor: 4000
    },
    guests: {
        min: 20,
        max: 300,
        default: 50
    }
};

const PRICES = CONFIG.prices;
const WHATSAPP_PHONE = CONFIG.whatsapp.phone;