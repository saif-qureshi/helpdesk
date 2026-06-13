/**
 * IANA timezone list from the runtime (`Intl.supportedValuesOf`) — available in
 * Node 18+ and evergreen browsers. Computed once; the list is identical on
 * server and client, so it's safe to share between RSC and client components.
 */
function loadTimezones(): string[] {
  const supportedValuesOf = (
    Intl as unknown as {
      supportedValuesOf?: (key: "timeZone") => string[];
    }
  ).supportedValuesOf;

  if (typeof supportedValuesOf === "function") {
    try {
      return supportedValuesOf("timeZone");
    } catch {
      /* fall through to fallback */
    }
  }
  return ["UTC"];
}

export const TIMEZONES: readonly string[] = loadTimezones();
export const DEFAULT_TIMEZONE = "Europe/London";
