import { Wand2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function PlaybooksPage() {
  return (
    <div>
      <header className="border-b border-border bg-card px-8 py-5">
        <div className="mb-1 inline-flex items-center gap-1.5 text-xs text-ai-muted-foreground">
          <Wand2 size={12} /> Automation
        </div>
        <h1 className="text-[22px] font-semibold text-foreground">Bot playbooks</h1>
      </header>
      <EmptyState
        icon={Wand2}
        title="Playbooks are coming soon"
        description="Design step-by-step automations that let the AI resolve common requests end-to-end before escalating to an agent."
        action={<Button variant="aiGhost">Request early access</Button>}
      />
    </div>
  );
}
