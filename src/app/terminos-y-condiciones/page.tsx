import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";
import TerminosCondicionesText from "@/components/legal/TerminosCondicionesText";

export const metadata = generateLegalMetadata(
  "Términos y Condiciones",
  "Términos y Condiciones de El Legado Catering. Condiciones de uso del cotizador y servicios de catering."
);

export default function TerminosCondiciones() {
  return (
    <LegalPageShell
      title="Términos y Condiciones"
      badge="Condiciones de Uso"
    >
      <TerminosCondicionesText />
    </LegalPageShell>
  );
}
