const SERVICES = [
  {
    title: "Bandejas de Desayuno",
    desc: "Desayunos completos y artesanales",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 15.546c-.523 0-1.046.523-1.046 1.046s.523 1.046 1.046 1.046 1.046-.523 1.046-1.046-.523-1.046-1.046-1.046zM9.684 13.536a3 3 0 104.632 4.632m-4.632-4.632a3 3 0 014.632 4.632m-4.632-4.632a3 3 0 014.632-4.632M9.684 13.536V6.404M21 15.546V9.404m-9.316 4.132a3 3 0 11-4.632-4.632m4.632 4.632a3 3 0 11-4.632 4.632m4.632-4.632a3 3 0 114.632-4.632"
      />
    ),
  },
  {
    title: "Brunch",
    desc: "Combinación perfecta de desayuno y almuerzo",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Servicio de Barman",
    desc: "Bartender profesional para tus eventos",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
  {
    title: "Bebidas Frías y Calientes",
    desc: "Servicio de bebidas para eventos",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
  },
];

export default function Proximamente() {
  return (
    <div className="mt-24">
      <div className="text-center mb-12">
        <span className="text-brand-copper font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
          Próximamente
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-dark-elegant">
          Más Servicios
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl p-6 text-center shadow-lg border border-brand-copper/10 hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-brand-copper"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {s.icon}
              </svg>
            </div>
            <h3 className="font-serif text-xl text-dark-elegant mb-2">
              {s.title}
            </h3>
            <p className="text-slate-600 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
