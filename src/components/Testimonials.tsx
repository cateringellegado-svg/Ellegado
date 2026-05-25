export default function Testimonials() {
  return (
    <section
      id="testimonios"
      className="py-32 bg-white border-t border-brand-copper/5"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
            Experiencias Reales
          </span>
          <h2 className="font-serif text-5xl md:text-6xl mb-6">
            Momentos Eternos
          </h2>
          <p className="text-slate-500 font-light italic max-w-xl mx-auto">
            Lo que dicen quienes han confiado su celebración y recuerdos en
            nuestras manos.
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-brand-copper to-transparent mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 text-left">
          <article className="bg-cream rounded-3xl p-8 border border-brand-copper/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-brand-copper/10 pb-4">
                <div>
                  <h4 className="font-serif text-2xl font-semibold text-brand-copper italic">
                    Boda de Sofía &amp; Diego
                  </h4>
                  <span className="text-[10px] text-slate-600 tracking-wider uppercase font-medium">
                    Boda al Aire Libre &bull; 120 Invitados
                  </span>
                </div>
                <div className="flex text-amber-500 text-sm">★★★★★</div>
              </div>
              <p className="font-serif text-lg text-slate-700 italic leading-relaxed">
                &ldquo;El servicio de El Legado fue sencillamente excepcional.
                Nuestros invitados no pararon de elogiar los mini churrascos
                gourmet y la fina variedad dulce. El trato tan humano y
                profesional del personal nos dio una tranquilidad impagable en
                nuestro gran día. ¡Hicieron eterno nuestro momento!&rdquo;
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-copper/5 flex items-center justify-between text-[10px] font-semibold text-brand-copper tracking-widest uppercase">
              <span>Menú: Salado + Dulce + Staff</span>
              <span className="text-[9px] text-slate-400 font-normal normal-case">
                Vía Google Reviews
              </span>
            </div>
          </article>

          <article className="bg-cream rounded-3xl p-8 border border-brand-copper/10 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 flex flex-col justify-between group">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-brand-copper/10 pb-4">
                <div>
                  <h4 className="font-serif text-2xl font-semibold text-brand-copper italic">
                    Lanzamiento Corporativo Tech
                  </h4>
                  <span className="text-[10px] text-slate-600 tracking-wider uppercase font-medium">
                    Evento Empresarial &bull; 80 Invitados
                  </span>
                </div>
                <div className="flex text-amber-500 text-sm">★★★★★</div>
              </div>
              <p className="font-serif text-lg text-slate-700 italic leading-relaxed">
                &ldquo;Organizar el catering para eventos corporativos suele ser
                complejo, pero con El Legado todo fluyó a la perfección. La
                presentación de los canapés fue impecable y elegante, los
                sabores exquisitos y el servicio de vajilla y garzones
                sumamente profesional. Un éxito total recomendado al
                100%.&rdquo;
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-copper/5 flex items-center justify-between text-[10px] font-semibold text-brand-copper tracking-widest uppercase">
              <span>Menú: Salado + Staff + Decoración</span>
              <span className="text-[9px] text-slate-400 font-normal normal-case">
                Vía LinkedIn Reviews
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
