"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SettingsHeader } from "@/components/settings/page-header";

export default function SecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="min-h-full">
      <SettingsHeader title="Security" sub="SSO, audit log, and access controls." />
      <div className="mx-auto max-w-[720px] space-y-6 px-8 py-6 pb-16">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                SAML single sign-on
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sign in via your identity provider. Available on Enterprise.
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Configure
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Two-factor authentication
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Require 2FA for all members of this workspace.
              </p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Audit log</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                7,412 events recorded · last 90 days
              </p>
            </div>
            <Button variant="ghost" size="sm">
              View log →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
