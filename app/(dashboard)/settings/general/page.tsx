import { Building2, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsHeader } from "@/components/settings/page-header";
import { SimpleSelect } from "@/components/shared/simple-select";
import { TimezoneField } from "@/components/settings/timezone-field";

export default function GeneralSettingsPage() {
  return (
    <div className="min-h-full">
      <SettingsHeader title="General" sub="Workspace name, branding, and defaults." />
      <div className="mx-auto max-w-[720px] space-y-6 px-8 py-6 pb-16">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Workspace</h3>
          <div className="space-y-4">
            <Field label="Name">
              <Input defaultValue="Northwind Support" icon={Building2} />
            </Field>
            <Field label="Subdomain" hint="northwind.resolv.ai">
              <Input defaultValue="northwind" icon={Globe} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Industry">
                <SelectField
                  defaultValue="SaaS"
                  options={["SaaS", "E-commerce", "Healthcare", "Agency", "Other"]}
                />
              </Field>
              <Field label="Team size">
                <SelectField
                  defaultValue="2-10"
                  options={["Just me", "2-10", "11-50", "50+"]}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default language">
                <SelectField
                  defaultValue="English (US)"
                  options={["English (US)", "English (UK)", "Spanish", "French", "German"]}
                />
              </Field>
              <Field label="Timezone">
                <TimezoneField defaultValue="Europe/London" />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Branding</h3>
          <div className="flex items-center gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai text-white">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <Button variant="secondary" size="sm">
                Upload logo
              </Button>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                PNG or SVG · at least 256×256
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SelectField({
  defaultValue,
  options,
}: {
  defaultValue: string;
  options: readonly string[];
}) {
  return <SimpleSelect defaultValue={defaultValue} options={options} />;
}
