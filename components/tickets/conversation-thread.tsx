import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer, Message } from "@/types";
import { agentById } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { Badge } from "@/components/ui/badge";

export function ConversationThread({
  messages,
  customer,
}: {
  messages: Message[];
  customer?: Customer;
}) {
  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <ThreadMessage key={m.id} message={m} customer={customer} />
      ))}
    </div>
  );
}

function ThreadMessage({
  message,
  customer,
}: {
  message: Message;
  customer?: Customer;
}) {
  if (message.type === "system") {
    return (
      <div className="py-1 text-center text-[11px] text-muted-foreground">
        <span className="inline-block rounded-full border border-border bg-muted/50 px-2 py-0.5">
          {message.body} · {message.time}
        </span>
      </div>
    );
  }

  if (message.type === "ai-internal") {
    return (
      <div className="flex items-center justify-center gap-1.5 py-1 text-center text-[11px] italic text-ai-muted-foreground">
        <Sparkles size={11} /> {message.body} · {message.time}
      </div>
    );
  }

  const isCustomer = message.type === "customer";
  const isAi = message.type === "ai";
  const agent = agentById(message.authorId);
  const reviewer = agentById(message.reviewedById);
  const authorName = isCustomer
    ? (customer?.name ?? "Customer")
    : isAi
      ? "AI assistant"
      : (agent?.name ?? "Agent");

  return (
    <div className={cn("flex gap-3", !isCustomer && "flex-row-reverse")}>
      <div className="flex-shrink-0">
        {isCustomer ? (
          <AgentAvatar person={customer} size={32} />
        ) : isAi ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ai to-ai-muted-foreground text-white">
            <Sparkles size={14} />
          </span>
        ) : (
          <AgentAvatar person={agent} size={32} />
        )}
      </div>
      <div
        className={cn(
          "min-w-0 max-w-[600px]",
          !isCustomer && "flex flex-col items-end",
        )}
      >
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-medium text-foreground">{authorName}</span>
          {isAi && (
            <Badge tone="ai" icon={Sparkles}>
              AI{reviewer ? ` · reviewed by ${reviewer.name.split(" ")[0]}` : ""}
            </Badge>
          )}
          <span className="text-muted-foreground">{message.time}</span>
        </div>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-lg border p-3.5 text-[13px] leading-relaxed text-foreground/90",
            isCustomer && "rounded-tl-none border-border bg-muted/40",
            isAi && "rounded-tr-none border-ai-border bg-ai-muted",
            !isCustomer &&
              !isAi &&
              "rounded-tr-none border-primary-border/60 bg-primary-muted/60",
          )}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}
