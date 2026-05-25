"use client";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-brand-copper/10">
      <p className="text-xs text-slate-500">
        Mostrando <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> de{" "}
        <span className="font-medium">{total}</span> resultados
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-brand-copper/20 text-slate-600 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-brand-copper/20 text-slate-600 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
