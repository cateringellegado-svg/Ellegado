import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";
import PoliticasContratacionText from "@/components/legal/PoliticasContratacionText";

export const metadata = generateLegalMetadata(
  "Políticas de Contratación",
  "Políticas de Contratación de El Legado Catering. Reserva, seña, cancelaciones, ajuste por inflación y modificaciones."
);

export default function PoliticasContratacion() {
  return (
    <LegalPageShell
      title="Políticas de Contratación"
      badge="Términos y Condiciones del Servicio"
    >
      <PoliticasContratacionText />
    </LegalPageShell>
  );
}
