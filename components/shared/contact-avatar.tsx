import { cn } from "@/lib/utils";
import type { ChannelId, Contact } from "@/lib/conversation-data";
import { ChannelDot } from "@/components/shared/channel-mark";

export function ContactAvatar({
  contact,
  size = 38,
  channel,
  className,
}: {
  contact: Pick<Contact, "initials" | "color" | "name"> | null;
  size?: number;
  channel?: ChannelId;
  className?: string;
}) {
  const initials = contact?.initials || contact?.name?.slice(0, 2).toUpperCase() || "?";
  const bg = contact?.color ?? "#CBD5E1";
  return (
    <div
      className={cn("relative inline-flex flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="inline-flex h-full w-full select-none items-center justify-center rounded-full font-semibold text-white"
        style={{ background: bg, fontSize: size * 0.36 }}
      >
        {initials}
      </div>
      {channel ? (
        <ChannelDot channel={channel} size={Math.round(size * 0.42)} />
      ) : null}
    </div>
  );
}
