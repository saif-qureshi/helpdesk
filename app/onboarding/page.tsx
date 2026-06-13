"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Mail,
  Sparkles,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";
import { DEFAULT_TIMEZONE, TIMEZONES } from "@/lib/timezones";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/shared/simple-select";
import { Combobox } from "@/components/shared/combobox";

interface Invite {
  email: string;
  role: "Agent" | "Admin";
}

const STEPS = [
  { title: `Set up your helpdesk`, sub: "This takes 2 minutes." },
  {
    title: "Connect your support inbox",
    sub: `${BRAND_NAME} will start triaging incoming email automatically.`,
  },
  {
    title: "Invite your team",
    sub: "You can add more teammates anytime from Settings.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [industry, setIndustry] = useState("SaaS");
  const [teamSize, setTeamSize] = useState("2-10");
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [inbox, setInbox] = useState<"gmail" | "outlook" | null>(null);
  const [invites, setInvites] = useState<Invite[]>([
    { email: "priya@northwind.io", role: "Admin" },
    { email: "daniel@northwind.io", role: "Agent" },
  ]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step]!;

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Auto-fill the subdomain from the workspace name until the user edits it.
  const onWorkspaceChange = (value: string) => {
    setWorkspace(value);
    if (!subdomainTouched) setSubdomain(slugify(value));
  };
  const onSubdomainChange = (value: string) => {
    setSubdomainTouched(true);
    setSubdomain(slugify(value));
  };

  const finish = async () => {
    const name = workspace.trim();
    const slug = (subdomain || slugify(name)).trim();
    if (!name || !slug) {
      setError("Please enter a workspace name.");
      setStep(0);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          logoUrl: logo,
          industry,
          teamSize,
          defaultLanguage: language,
          timezone,
          invites: invites.map((i) => ({
            email: i.email,
            role: i.role === "Admin" ? "ADMIN" : "AGENT",
          })),
        }),
      });

      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent("/onboarding")}`);
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string; error?: string }
          | null;
        throw new Error(data?.message ?? data?.error ?? "Something went wrong.");
      }

      router.push("/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-muted/40">
      <div className="sticky top-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex min-h-full flex-col px-6 py-8">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai text-white">
            <Sparkles size={14} />
          </span>
          <span className="text-[15px] font-semibold text-foreground">
            {BRAND_NAME}
          </span>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-8 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            {current.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>
        </div>

        <div className="flex flex-1 justify-center">
          <div className="w-[480px]">
            <Card className="p-7">
              {step === 0 && (
                <StepWorkspace
                  workspace={workspace}
                  onWorkspaceChange={onWorkspaceChange}
                  subdomain={subdomain}
                  onSubdomainChange={onSubdomainChange}
                  logo={logo}
                  setLogo={setLogo}
                  industry={industry}
                  setIndustry={setIndustry}
                  teamSize={teamSize}
                  setTeamSize={setTeamSize}
                  language={language}
                  setLanguage={setLanguage}
                  timezone={timezone}
                  setTimezone={setTimezone}
                />
              )}
              {step === 1 && <StepInbox selected={inbox} onSelect={setInbox} />}
              {step === 2 && (
                <StepInvite
                  invites={invites}
                  setInvites={setInvites}
                  draft={draft}
                  setDraft={setDraft}
                />
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-danger-border bg-danger-muted/60 p-3 text-[13px] text-danger-muted-foreground">
                  <X size={14} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-7 flex items-center gap-2">
                {step > 0 && (
                  <Button
                    variant="secondary"
                    icon={ChevronLeft}
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                )}
                <div className="flex-1" />
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep(step + 1)}>Continue</Button>
                ) : (
                  <Button icon={Check} onClick={finish} disabled={submitting}>
                    {submitting ? "Creating workspace…" : "Send invites & finish"}
                  </Button>
                )}
              </div>
            </Card>
            {step > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() =>
                    step < STEPS.length - 1 ? setStep(step + 1) : finish()
                  }
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-2 mt-12 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Lock size={10} /> SOC 2 Type II
          </span>
          <span>·</span>
          <span>GDPR compliant</span>
          <span>·</span>
          <span>EU data residency</span>
        </div>
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

function StepWorkspace({
  workspace,
  onWorkspaceChange,
  subdomain,
  onSubdomainChange,
  logo,
  setLogo,
  industry,
  setIndustry,
  teamSize,
  setTeamSize,
  language,
  setLanguage,
  timezone,
  setTimezone,
}: {
  workspace: string;
  onWorkspaceChange: (v: string) => void;
  subdomain: string;
  onSubdomainChange: (v: string) => void;
  logo: string | null;
  setLogo: (v: string | null) => void;
  industry: string;
  setIndustry: (v: string) => void;
  teamSize: string;
  setTeamSize: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
}) {
  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Logo */}
      <Field label="Workspace logo" hint="PNG or SVG · at least 256×256. Optional.">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <Building2 size={20} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium shadow-xs hover:bg-muted">
              <Upload size={13} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
            </label>
            {logo && (
              <button
                onClick={() => setLogo(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Workspace name">
        <Input
          icon={Building2}
          placeholder="Northwind Support"
          value={workspace}
          onChange={(e) => onWorkspaceChange(e.target.value)}
        />
      </Field>

      <Field label="Subdomain" hint={`Your workspace URL — you can change it later.`}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              icon={Globe}
              placeholder="northwind"
              value={subdomain}
              onChange={(e) => onSubdomainChange(e.target.value)}
            />
          </div>
          <span className="text-[13px] text-muted-foreground">.{BRAND_NAME}</span>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Industry">
          <SimpleSelect
            value={industry}
            onValueChange={setIndustry}
            options={["SaaS", "E-commerce", "Healthcare", "Agency", "Other"]}
          />
        </Field>

        <Field label="Default language">
          <SimpleSelect
            value={language}
            onValueChange={setLanguage}
            options={["English (US)", "English (UK)", "Spanish", "French", "German"]}
          />
        </Field>
      </div>

      <Field label="Timezone">
        <Combobox
          value={timezone}
          onValueChange={setTimezone}
          options={TIMEZONES}
          placeholder="Select a timezone"
          searchPlaceholder="Search timezones…"
        />
      </Field>

      <Field label="Team size">
        <div className="grid grid-cols-4 gap-2">
          {["Just me", "2-10", "11-50", "50+"].map((s) => (
            <button
              key={s}
              onClick={() => setTeamSize(s)}
              className={cn(
                "h-10 rounded-md border-2 px-3 text-xs font-medium transition-colors",
                teamSize === s
                  ? "border-primary bg-primary-muted/50 text-primary-muted-foreground"
                  : "border-border bg-background text-foreground hover:border-muted-foreground/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StepInbox({
  selected,
  onSelect,
}: {
  selected: "gmail" | "outlook" | null;
  onSelect: (v: "gmail" | "outlook") => void;
}) {
  const options = [
    { id: "gmail" as const, label: "Connect Gmail", sub: "OAuth · forwards support@ to your inbox" },
    { id: "outlook" as const, label: "Connect Outlook", sub: "OAuth · works with Microsoft 365 and Exchange" },
  ];
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className={cn(
            "flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors",
            selected === o.id
              ? "border-primary bg-primary-muted/40"
              : "border-border hover:border-muted-foreground/40",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
            <Mail size={18} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{o.label}</div>
            <div className="text-xs text-muted-foreground">{o.sub}</div>
          </div>
          {selected === o.id ? (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check size={12} />
            </span>
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
        </button>
      ))}
      <div className="pt-2 text-center">
        <button className="text-xs font-medium text-primary-muted-foreground hover:opacity-80">
          Use a forwarding address instead →
        </button>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-md border border-ai-border bg-ai-muted/60 p-3">
        <Sparkles size={14} className="mt-0.5 flex-shrink-0 text-ai" />
        <p className="text-xs leading-relaxed text-foreground/80">
          {BRAND_NAME} classifies and routes your first{" "}
          <span className="font-semibold">100 tickets free</span> while it learns
          your tone — no AI usage charges during onboarding.
        </p>
      </div>
    </div>
  );
}

function StepInvite({
  invites,
  setInvites,
  draft,
  setDraft,
}: {
  invites: Invite[];
  setInvites: (v: Invite[]) => void;
  draft: string;
  setDraft: (v: string) => void;
}) {
  const add = () => {
    const email = draft.trim();
    if (!email) return;
    setInvites([...invites, { email, role: "Agent" }]);
    setDraft("");
  };
  return (
    <div className="space-y-4">
      <Field
        label="Email addresses"
        hint="Press Enter or comma to add each teammate."
      >
        <div className="relative">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="teammate@northwind.io"
            className="h-9 w-full rounded-md border border-border bg-background pl-3 pr-20 text-[13px] placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={add}
            className="absolute right-1 top-1 h-7 rounded px-2 text-xs font-medium text-primary-muted-foreground hover:bg-primary-muted"
          >
            + Add
          </button>
        </div>
      </Field>

      {invites.length > 0 && (
        <div className="space-y-2">
          {invites.map((inv, i) => (
            <div
              key={`${inv.email}-${i}`}
              className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-2.5"
            >
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                <Mail size={12} />
              </div>
              <span className="flex-1 truncate text-[13px] text-foreground">
                {inv.email}
              </span>
              <div className="inline-flex items-center rounded-md border border-border bg-background p-0.5">
                {(["Agent", "Admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      setInvites(
                        invites.map((v, x) => (x === i ? { ...v, role: r } : v)),
                      )
                    }
                    className={cn(
                      "h-6 rounded px-2.5 text-[11px] font-medium",
                      inv.role === r
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setInvites(invites.filter((_, x) => x !== i))}
                className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Remove invite"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="inline-flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
        <UserPlus size={12} /> {invites.length} teammates will get an invite email
      </div>
    </div>
  );
}
