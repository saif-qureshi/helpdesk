import {
  CheckCircle2,
  Clock,
  type LucideIcon,
  Mail,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHANNELS,
  URGENCY_COLOR,
  agentById,
  contactById,
  shopifyByContact,
  type Conversation,
  type ShopifyOrder,
} from "@/lib/conversation-data";
import { CHANNEL_GLYPH, ChInstagram } from "@/components/icons/channels";
import { ShopifyMark } from "@/components/icons/shopify-mark";
import { ChannelBadge } from "@/components/shared/channel-mark";
import { ContactAvatar } from "@/components/shared/contact-avatar";

export function ContextDrawer({ cv }: { cv: Conversation }) {
  const contact = contactById(cv.contactId)!;
  const shop = shopifyByContact(cv.contactId);
  const assignee = cv.assigneeId ? agentById(cv.assigneeId) : null;

  return (
    <div className="h-full w-[320px] flex-shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3">
          <ContactAvatar contact={contact} size={44} channel={cv.channel} />
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-slate-900">
              {contact.name}
            </div>
            <div className="text-[11.5px] text-slate-500">
              {shop ? `Customer since ${shop.since}` : "Not a customer yet"}
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          {contact.phone ? <ContactLine icon={Phone} value={contact.phone} /> : null}
          {contact.email ? <ContactLine icon={Mail} value={contact.email} /> : null}
          {contact.handle ? (
            <ContactLine
              iconNode={<ChInstagram size={13} className="text-slate-400" />}
              value={contact.handle}
            />
          ) : null}
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Reached us on
          </div>
          <div className="flex items-center gap-1.5">
            {contact.channels.map((chId) => {
              const ch = CHANNELS[chId];
              const Glyph = CHANNEL_GLYPH[chId];
              return (
                <span
                  key={chId}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{ background: ch.color }}
                  title={ch.label}
                >
                  <Glyph size={13} />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {shop ? (
        <div className="border-b border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShopifyMark size={15} />
              <span className="text-[12px] font-semibold text-slate-700">
                Shopify
              </span>
            </div>
            <button className="inline-flex items-center gap-0.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800">
              Open ↗
            </button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Stat
              label="Lifetime value"
              value={`₹${shop.ltv.toLocaleString("en-IN")}`}
            />
            <Stat label="Orders" value={String(shop.orders.length)} />
          </div>

          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Recent orders
          </div>
          <div className="space-y-2">
            {shop.orders.slice(0, 3).map((o) => (
              <OrderCard key={o.no} order={o} />
            ))}
          </div>

          {shop.returns.length > 0 ? (
            <>
              <div className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Open returns
              </div>
              {shop.returns.map((r) => (
                <div
                  key={r.no}
                  className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[12px] text-slate-800">
                      {r.no}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-600">
                    {r.item} · {r.reason}
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>
      ) : (
        <div className="border-b border-slate-100 p-4">
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
            <ShopifyMark size={20} className="mx-auto mb-2 opacity-50" />
            <p className="text-[12px] leading-relaxed text-slate-500">
              No matching Shopify customer for this contact yet.
            </p>
            <button className="mt-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-800">
              Search &amp; link manually
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Conversation
        </div>
        <div className="space-y-2 text-[12px]">
          <MetaRow
            label="Channel"
            value={<ChannelBadge channel={cv.channel} withLabel />}
          />
          <MetaRow
            label="AI category"
            value={
              <span className="inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                {cv.aiCategory}
              </span>
            }
          />
          <MetaRow
            label="AI urgency"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: URGENCY_COLOR[cv.aiUrgency] }}
                />
                <span className="capitalize text-slate-700">
                  {cv.aiUrgency}
                </span>
              </span>
            }
          />
          <MetaRow
            label="Sentiment"
            value={<span className="text-slate-700">{cv.sentiment}</span>}
          />
          <MetaRow
            label="Assignee"
            value={
              assignee ? (
                <span className="inline-flex items-center gap-1.5">
                  <ContactAvatar
                    contact={{
                      initials: assignee.initials,
                      color: assignee.color,
                      name: assignee.name,
                    }}
                    size={18}
                  />
                  <span className="text-slate-700">
                    {assignee.name.split(" ")[0]}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400">Unassigned</span>
              )
            }
          />
          {cv.channel === "whatsapp" && cv.session ? (
            <MetaRow
              label="WA session"
              value={
                cv.session.open ? (
                  <span className="font-medium text-emerald-600">
                    {cv.session.hoursLeft}h left
                  </span>
                ) : (
                  <span className="font-medium text-amber-600">Expired</span>
                )
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ContactLine({
  icon: Icon,
  iconNode,
  value,
}: {
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-slate-600">
      {Icon ? (
        <Icon size={13} className="flex-shrink-0 text-slate-400" />
      ) : (
        iconNode
      )}
      <span className="truncate">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
      <div className="text-[10.5px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-[15px] font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: ShopifyOrder }) {
  const statusStyle =
    order.status === "Shipped"
      ? "bg-sky-50 text-sky-700"
      : order.status === "Delivered"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700";
  const StatusIcon: LucideIcon =
    order.status === "Shipped"
      ? Truck
      : order.status === "Delivered"
        ? CheckCircle2
        : order.status === "Processing"
          ? Clock
          : Package;
  return (
    <div className="cursor-pointer rounded-lg border border-slate-200 p-2.5 hover:border-slate-300">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[12px] font-medium text-slate-800">
          {order.no}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
            statusStyle,
          )}
        >
          <StatusIcon size={11} />
          {order.status}
        </span>
      </div>
      <div className="mb-1 truncate text-[11.5px] text-slate-500">
        {order.items.join(", ")}
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{order.date}</span>
        <span className="font-medium text-slate-700">
          ₹{order.total.toLocaleString("en-IN")}
        </span>
      </div>
      {order.tracking ? (
        <div className="mt-1.5 flex items-center gap-1 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
          <Truck size={11} /> {order.courier} ·{" "}
          <span className="font-mono">{order.tracking}</span>
        </div>
      ) : null}
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}
