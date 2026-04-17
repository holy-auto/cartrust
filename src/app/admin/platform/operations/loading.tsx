export default function PlatformOperationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
        <div className="h-8 w-64 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
        <div className="h-4 w-80 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.06)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 space-y-2">
            <div className="h-3 w-16 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
            <div className="h-7 w-20 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
          </div>
        ))}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="border-b border-border-subtle p-5 space-y-1">
          <div className="h-3 w-20 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
          <div className="h-5 w-32 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.08)]" />
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 flex-1 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.06)]" />
              <div className="h-4 w-24 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.06)]" />
              <div className="h-4 w-20 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.06)]" />
              <div className="h-4 w-16 rounded bg-border-subtle dark:bg-[rgba(255,255,255,0.06)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
