import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Underline-style tab bar (controlled) — a thin composite over the design
 * tokens for the inbox/team filter tabs. For Radix tab panels use the shadcn
 * `Tabs` primitive in components/ui/tabs.tsx.
 */
export function TabBar({ items, active, onChange, className }: TabBarProps) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-border", className)}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "-mb-px inline-flex h-9 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary-muted-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                  isActive
                    ? "bg-primary-muted text-primary-muted-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
