"use client";

import { useState } from "react";
import { getAllIcons, getIconLabel } from "@/lib/icons";

interface Props {
  value: string;
  onChange: (name: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const icons = getAllIcons();
  const selected = icons.find((i) => i.name === value);
  const IconComp = selected?.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full bg-white border border-brand-copper/20 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-brand-copper transition-colors"
      >
        {IconComp && <IconComp className="w-4 h-4 text-brand-copper" />}
        <span className="flex-1 text-left">{selected?.label ?? "Seleccionar icono"}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-brand-copper/10 rounded-xl shadow-xl p-3 w-72 max-h-64 overflow-y-auto grid grid-cols-5 gap-1">
            {icons.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); setOpen(false); }}
                className={`p-2 rounded-lg hover:bg-brand-copper/10 transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                  value === name ? "bg-brand-copper/15 ring-2 ring-brand-copper/30" : ""
                }`}
                title={getIconLabel(name)}
              >
                <Icon className="w-5 h-5 text-dark-elegant" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
