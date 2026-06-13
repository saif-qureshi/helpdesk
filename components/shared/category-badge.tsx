import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** AI-assigned ticket category (violet, sparkle). */
export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge tone="ai" icon={Sparkles}>
      {category}
    </Badge>
  );
}
