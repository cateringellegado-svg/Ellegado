import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PorQueElegirnos from "@/components/PorQueElegirnos";
import Philosophy from "@/components/Philosophy";
import Festin from "@/components/Festin";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <PorQueElegirnos />
        <Philosophy />
        <Festin />
        <Gallery />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <CookieConsent />
    </>
  );
}
