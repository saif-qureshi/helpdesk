import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function HelpCenterPage() {
  return (
    <div>
      <header className="border-b border-border bg-card px-8 py-5">
        <div className="mb-1 text-xs text-muted-foreground">Knowledge</div>
        <h1 className="text-[22px] font-semibold text-foreground">Help center</h1>
      </header>
      <EmptyState
        icon={BookOpen}
        title="No articles yet"
        description="Write knowledge base articles and the AI will cite them when drafting replies and answering in the chat widget."
        action={<Button>Create your first article</Button>}
      />
    </div>
  );
}
