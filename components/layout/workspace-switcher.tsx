import { ChevronsUpDown, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export function WorkspaceSwitcher({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <button className="flex h-14 items-center gap-2.5 border-b border-border px-4 hover:bg-muted/60">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="h-7 w-7 flex-shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai text-white">
          <Sparkles size={14} />
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-semibold text-foreground">
          {name}
        </span>
        <span className="block truncate text-[10px] text-muted-foreground">
          {BRAND_NAME}
        </span>
      </span>
      <ChevronsUpDown size={13} className="text-muted-foreground" />
    </button>
  );
}
