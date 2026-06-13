"use client";

import { TEMPLATES, type TemplateRecord } from "@/lib/conversation-data";

export function TemplatePicker({
  onPick,
}: {
  onPick: (t: TemplateRecord) => void;
}) {
  const approved = TEMPLATES.filter((t) => t.status === "Approved");
  return (
    <div className="absolute bottom-10 left-0 z-30 w-80 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
      <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Approved templates
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {approved.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="w-full px-3 py-2 text-left hover:bg-slate-50"
          >
            <div className="mb-0.5 flex items-center gap-2">
              <span className="font-mono text-[12px] text-slate-800">
                {t.name}
              </span>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {t.lang}
              </span>
            </div>
            <p className="truncate text-[11.5px] text-slate-500">{t.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
