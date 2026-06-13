export function SettingsHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-6">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Settings</div>
          <h1 className="text-[22px] font-semibold text-foreground">{title}</h1>
          {sub && <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
