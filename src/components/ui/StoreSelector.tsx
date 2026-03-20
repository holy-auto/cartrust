"use client";

import { useStoreContext } from "@/lib/stores/StoreContext";

export default function StoreSelector() {
  const { stores, activeStoreId, setActiveStoreId, loading } = useStoreContext();

  if (loading || stores.length <= 1) return null;

  return (
    <div className="border-b border-border-subtle px-3 py-2">
      <select
        value={activeStoreId ?? ""}
        onChange={(e) => setActiveStoreId(e.target.value || null)}
        className="w-full rounded-[var(--radius-md)] border border-border-default bg-[var(--bg-elevated)] px-2.5 py-1.5 text-[12px] font-medium text-primary outline-none transition-all focus:border-[var(--border-focus)] focus:ring-1 focus:ring-accent"
      >
        <option value="">全店舗</option>
        {stores
          .filter((s) => s.is_active)
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>
    </div>
  );
}
