export function MiniBars({
  total,
  ai,
}: {
  total: number[];
  ai: number[];
}) {
  const max = Math.max(...total) * 1.1;
  return (
    <div className="flex h-40 items-end gap-1.5">
      {total.map((t, i) => (
        <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
          <div
            className="relative w-full rounded-t bg-slate-200"
            style={{ height: `${(t / max) * 100}%` }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t bg-violet-500"
              style={{ height: `${(ai[i]! / t) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
