"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const labelFor = (v: string) =>
  v === "all" ? "Any" : v.charAt(0).toUpperCase() + v.slice(1);

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = value !== "all";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium",
          active
            ? "border-primary-border bg-primary-muted text-primary-muted-foreground"
            : "border-border bg-background text-foreground hover:bg-muted",
        )}
      >
        <span className="text-muted-foreground">{label}:</span>
        {labelFor(value)}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-20 min-w-[140px] rounded-md border border-border bg-popover py-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={cn(
                "flex h-8 w-full items-center justify-between px-3 text-[13px] hover:bg-muted",
                value === o
                  ? "text-primary-muted-foreground"
                  : "text-foreground",
              )}
            >
              <span>{labelFor(o)}</span>
              {value === o && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
