"use client";

import { useState } from "react";
import { Combobox } from "@/components/shared/combobox";
import { TIMEZONES } from "@/lib/timezones";

/** Searchable timezone picker with self-contained state (for static settings). */
export function TimezoneField({ defaultValue }: { defaultValue: string }) {
  const [tz, setTz] = useState(defaultValue);
  return (
    <Combobox
      value={tz}
      onValueChange={setTz}
      options={TIMEZONES}
      placeholder="Select a timezone"
      searchPlaceholder="Search timezones…"
    />
  );
}
