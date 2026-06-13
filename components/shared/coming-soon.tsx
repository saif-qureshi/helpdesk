import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-8 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Icon size={28} />
      </div>
      <h1 className="text-[20px] font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-500">
        {description}
      </p>
      <p className="mt-6 text-[11px] uppercase tracking-wide text-slate-400">
        Shipping in a later Phase 2 step.
      </p>
    </div>
  );
}
