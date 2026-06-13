import { cn } from "@/lib/utils";
import type { Agent, Customer } from "@/types";

type Person = Pick<Agent, "name" | "initials" | "color"> &
  Partial<Pick<Agent, "isOnline">>;

function initialsOf(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Avatar for an Agent or Customer. Shows an online dot for online agents. */
export function AgentAvatar({
  person,
  size = 28,
  showStatus = false,
  className,
}: {
  person?: Person | Customer | null;
  size?: number;
  showStatus?: boolean;
  className?: string;
}) {
  if (!person) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        ?
      </span>
    );
  }

  const initials =
    "initials" in person && person.initials
      ? person.initials
      : initialsOf(person.name);
  const color = "color" in person ? person.color : "#6366F1";
  const online = "isOnline" in person ? person.isOnline : undefined;

  return (
    <span className={cn("relative inline-flex flex-shrink-0", className)}>
      <span
        className="inline-flex select-none items-center justify-center rounded-full font-medium text-white"
        style={{ width: size, height: size, fontSize: size * 0.38, background: color }}
        title={person.name}
      >
        {initials}
      </span>
      {showStatus && online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
            online ? "bg-success" : "bg-muted-foreground/40",
          )}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </span>
  );
}
