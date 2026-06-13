export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
