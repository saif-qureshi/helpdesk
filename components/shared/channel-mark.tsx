import { cn } from "@/lib/utils";
import { CHANNELS, type ChannelId } from "@/lib/conversation-data";
import { CHANNEL_GLYPH } from "@/components/icons/channels";

export function ChannelGlyph({
  channel,
  size = 13,
  className,
}: {
  channel: ChannelId;
  size?: number;
  className?: string;
}) {
  const Glyph = CHANNEL_GLYPH[channel];
  return <Glyph size={size} className={className} />;
}

export function ChannelDot({
  channel,
  size = 16,
}: {
  channel: ChannelId;
  size?: number;
}) {
  const ch = CHANNELS[channel];
  const Glyph = CHANNEL_GLYPH[channel];
  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full text-white ring-2 ring-card"
      style={{ width: size, height: size, background: ch.color }}
      title={ch.label}
    >
      <Glyph size={Math.round(size * 0.62)} />
    </span>
  );
}

export function ChannelBadge({
  channel,
  withLabel = false,
  className,
}: {
  channel: ChannelId;
  withLabel?: boolean;
  className?: string;
}) {
  const ch = CHANNELS[channel];
  const Glyph = CHANNEL_GLYPH[channel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium",
        className,
      )}
      style={{ color: ch.color }}
    >
      <Glyph size={13} />
      {withLabel && ch.label}
    </span>
  );
}
