import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";

export const metadata = generateLegalMetadata(
  "Política de Privacidad",
  "Política de Privacidad de El Legado Catering. Conoce cómo protegemos tus datos personales conforme a la Ley 25.326."
);

export default function Privacidad() {
  return (
    <LegalPageShell
      title="Política de Privacidad"
      badge="Protección de Datos Personales"
    >
      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">1. Responsable del Tratamiento</h2>
        <p><strong>Identificación:</strong> El Legado Catering y Eventos</p>
        <p><strong>Email:</strong> catering.ellegado@gmail.com</p>
        <p><strong>Sitio web:</strong> https://ellegado.vercel.app</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">2. Datos que Recopilamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Datos de contacto:</strong> nombre, teléfono, email.</li>
          <li><strong>Datos del evento:</strong> tipo, invitados, servicios solicitados, presupuesto.</li>
          <li><strong>Datos de navegación:</strong> IP, navegador, páginas visitadas (cookies).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">3. Finalidad del Tratamiento</h2>
        <p>Utilizamos sus datos para procesar cotizaciones, contactarle respecto a su evento, gestionar la relación comercial y mejorar nuestros servicios. Base legal: su consentimiento (arts. 5° y 6° Ley 25.326).</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">4. Plazo de Conservación</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cotizaciones:</strong> 2 años desde su generación.</li>
          <li><strong>Datos de clientes:</strong> 5 años desde la última interacción.</li>
          <li><strong>Cookies:</strong> 12 meses.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">5. Derechos del Titular</h2>
        <p>Conforme a la Ley 25.326, usted tiene derecho a <strong>acceder, rectificar, suprimir</strong> sus datos u <strong>oponerse</strong> al tratamiento. Para ejercerlos, escriba a catering.ellegado@gmail.com. Responderemos dentro de 10 días hábiles.</p>
        <p className="mt-2">Puede presentar un reclamo ante la <strong>Dirección Nacional de Protección de Datos Personales</strong> en argentina.gob.ar/justicia/dnpdp.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">6. Cookies</h2>
        <p>Utilizamos cookies esenciales para el funcionamiento del cotizador y analíticas. Puede configurar su navegador para rechazarlas. Al aceptar, consiente su uso conforme a esta política.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">7. Transferencia Internacional de Datos</h2>
        <p>Utilizamos Supabase como infraestructura (servidores en EE.UU.) bajo acuerdos de procesamiento de datos. Al usar el sitio, usted consiente esta transferencia (art. 12 Ley 25.326).</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">8. Compartición con Terceros</h2>
        <p>No compartimos datos con fines comerciales. Solo con Supabase (infraestructura) y WhatsApp/Meta (cuando inicia una conversación).</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">9. Seguridad</h2>
        <p>Implementamos HTTPS/TLS, CSP, autenticación segura y RLS en base de datos para proteger sus datos.</p>
      </section>
    </LegalPageShell>
  );
}
