import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";

export const metadata = generateLegalMetadata(
  "Términos y Condiciones",
  "Términos y Condiciones de El Legado Catering. Condiciones de uso del cotizador y servicios de catering."
);

export default function Terminos() {
  return (
    <LegalPageShell
      title="Términos y Condiciones"
      badge="Condiciones de Uso"
    >
      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar el sitio web, incluyendo el cotizador online, usted acepta estos Términos y Condiciones. Si no está de acuerdo, no utilice nuestros servicios.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">2. Descripción del Servicio</h2>
        <p>Ofrecemos servicios de catering para eventos. Nuestro sitio permite explorar productos, generar cotizaciones estimadas y contactarnos vía WhatsApp.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">3. Cotizaciones Online</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Las cotizaciones son <strong>estimaciones referenciales</strong>.</li>
          <li>Los precios pueden variar según fecha, ubicación y requerimientos.</li>
          <li>No constituyen una reserva hasta confirmación por escrito.</li>
          <li>Los precios están expresados en Pesos Argentinos (ARS).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">4. Proceso de Reserva</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>El usuario genera una cotización.</li>
          <li>El Legado contacta para confirmar detalles y disponibilidad.</li>
          <li>Se envía propuesta formal con precios definitivos.</li>
          <li>El usuario acepta y realiza el pago de seña.</li>
          <li>Se confirma la reserva y se coordinan detalles finales.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">5. Política de Cancelación</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Más de 30 días: devolución del 50% de la seña.</li>
          <li>Entre 15 y 30 días: la seña no es reembolsable.</li>
          <li>Menos de 15 días: se cobra el 100% del servicio.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">6. Responsabilidades del Usuario</h2>
        <p>El usuario se compromete a proporcionar información veraz, no usar el cotizador con fines maliciosos, respetar plazos de pago e informar restricciones alimentarias con anticipación.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">7. Comunicación vía WhatsApp</h2>
        <p>Al usar nuestro enlace de WhatsApp, la comunicación se rige por la política de privacidad de Meta Platforms, Inc.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">8. Legislación Aplicable</h2>
        <p>Estos términos se rigen por la legislación argentina. Las partes se someten a los tribunales de la Ciudad Autónoma de Buenos Aires. Conforme a la Ley 24.240 de Defensa del Consumidor.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">9. Contacto</h2>
        <p><strong>Email:</strong> catering.ellegado@gmail.com</p>
      </section>
    </LegalPageShell>
  );
}
