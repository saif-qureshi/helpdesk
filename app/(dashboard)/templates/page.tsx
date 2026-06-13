import { LayoutTemplate } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function TemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      title="Message templates"
      description="Manage WhatsApp templates and their Meta approval status. Re-open expired sessions with one click."
    />
  );
}
