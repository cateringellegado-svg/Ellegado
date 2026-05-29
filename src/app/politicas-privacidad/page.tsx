import LegalPageShell, { generateLegalMetadata } from "@/components/LegalPageShell";
import PoliticasPrivacidadText from "@/components/legal/PoliticasPrivacidadText";

export const metadata = generateLegalMetadata(
  "Política de Privacidad",
  "Política de Privacidad de El Legado Catering. Conoce cómo protegemos tus datos personales conforme a la Ley 25.326."
);

export default function PoliticasPrivacidad() {
  return (
    <LegalPageShell
      title="Política de Privacidad"
      badge="Protección de Datos Personales"
    >
      <PoliticasPrivacidadText />
    </LegalPageShell>
  );
}
