import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";

export const metadata = generateLegalMetadata(
  "Aviso Legal",
  "Aviso Legal de El Legado Catering. Información legal, propiedad intelectual y condiciones de uso del sitio web."
);

export default function AvisoLegal() {
  return (
    <LegalPageShell
      title="Aviso Legal"
      badge="Información Legal"
    >
      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">1. Datos Identificativos</h2>
        <p>En cumplimiento con el deber de información, se facilitan los siguientes datos:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Empresa:</strong> El Legado Catering y Eventos</li>
          <li><strong>Domicilio:</strong> Buenos Aires, Argentina</li>
          <li><strong>Correo electrónico:</strong> catering.ellegado@gmail.com</li>
          <li><strong>Sitio web:</strong> https://ellegado.vercel.app</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">2. Objeto</h2>
        <p>El presente Aviso Legal regula el acceso, navegación y uso del sitio web https://ellegado.vercel.app, titularidad de El Legado Catering y Eventos. El acceso y/o uso de este sitio atribuye la condición de USUARIO, que acepta las Condiciones Generales de Uso aquí reflejadas.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">3. Uso del Portal</h2>
        <p>ellegado.vercel.app proporciona acceso a informaciones, servicios y datos pertenecientes a El Legado. El USUARIO se compromete a:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Utilizar el sitio de conformidad con la ley y el presente Aviso Legal.</li>
          <li>No realizar actividades ilícitas, lesivas o que puedan dañar la imagen de El Legado.</li>
          <li>No intentar acceder a áreas restringidas del sitio sin autorización.</li>
          <li>No introducir virus, malware o código malicioso.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">4. Propiedad Intelectual e Industrial</h2>
        <p>El Legado Catering y Eventos es titular de todos los derechos de propiedad intelectual e industrial de su página web, incluyendo imágenes, textos, logotipos, código fuente y diseño. Queda prohibida la reproducción, distribución, comunicación pública o transformación sin autorización expresa.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">5. Exclusión de Garantías y Responsabilidad</h2>
        <p>El Legado no se hace responsable de errores u omisiones en los contenidos, falta de disponibilidad temporal, transmisión de virus, daños derivados del uso inadecuado, o contenidos de sitios de terceros enlazados.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">6. Enlaces a Terceros</h2>
        <p>El sitio puede contener enlaces a sitios web de terceros (WhatsApp, redes sociales). El Legado no se responsabiliza del contenido o prácticas de dichos sitios.</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-brand-copper mb-3 font-medium">7. Legislación Aplicable y Jurisdicción</h2>
        <p>El presente Aviso Legal se rige por la legislación de la República Argentina. Para cualquier controversia, las partes se someten a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.</p>
      </section>
    </LegalPageShell>
  );
}
