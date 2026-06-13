import { ChevronDown, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_PERFORMANCE, agentById } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";

export function AgentTable() {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Th>Agent</Th>
          <Th sortable>Resolved</Th>
          <Th sortable>Avg. response</Th>
          <Th sortable>CSAT</Th>
          <Th sortable ai>
            AI drafts accepted
          </Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {AGENT_PERFORMANCE.map((row) => {
          const agent = agentById(row.agentId);
          if (!agent) return null;
          return (
            <tr
              key={agent.id}
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <AgentAvatar person={agent} size={26} showStatus />
                  <div>
                    <div className="text-[13px] font-medium text-foreground">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {agent.role}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 font-medium text-foreground">
                {row.resolved}
              </td>
              <td className="px-5 py-3 text-foreground/80">{row.avgResponse}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star size={12} className="fill-warning text-warning" />
                  {row.csat}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-ai"
                      style={{ width: `${row.aiAcceptRate}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-foreground/80">
                    {row.aiAcceptRate}%
                  </span>
                </div>
              </td>
              <td className="px-5 py-3">
                {agent.isOnline ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-success-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />{" "}
                    Active now
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Th({
  children,
  sortable,
  ai,
}: {
  children: React.ReactNode;
  sortable?: boolean;
  ai?: boolean;
}) {
  return (
    <th className={cn("px-5 py-2.5 text-left font-medium", ai && "text-ai-muted-foreground")}>
      <span className="inline-flex items-center gap-1.5">
        {ai && <Sparkles size={10} />}
        {children}
        {sortable && <ChevronDown size={10} className="opacity-40" />}
      </span>
    </th>
  );
}
