import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function KnowledgePage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Knowledge base"
      description="Articles that ground the AI's answers. Coming with Phase 6."
    />
  );
}
