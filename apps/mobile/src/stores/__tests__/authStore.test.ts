import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../authStore";
import type { UserProfile } from "@/lib/auth";

function resetStore() {
  useAuthStore.setState({
    user: null,
    selectedStore: null,
    isLoading: false,
    isAuthenticated: false,
  });
}

function makeUser(role: UserProfile["role"]): UserProfile {
  return {
    id: "u1",
    email: "u@example.com",
    role,
    tenantId: "t1",
    tenantName: "Test",
  } as UserProfile;
}

describe("useAuthStore", () => {
  beforeEach(resetStore);

  it("setUser は user と isAuthenticated を更新", () => {
    const u = makeUser("staff");
    useAuthStore.getState().setUser(u);
    const s = useAuthStore.getState();
    expect(s.user).toEqual(u);
    expect(s.isAuthenticated).toBe(true);
    expect(s.isLoading).toBe(false);
  });

  it("setUser(null) は認証解除", () => {
    useAuthStore.getState().setUser(makeUser("admin"));
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("reset は store を初期化", () => {
    useAuthStore.getState().setUser(makeUser("owner"));
    useAuthStore.getState().setSelectedStore({ id: "s1", name: "店A" });
    useAuthStore.getState().reset();

    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.selectedStore).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it("hasMinRole の階層判定: viewer < staff < admin < owner < super_admin", () => {
    useAuthStore.getState().setUser(makeUser("staff"));
    const { hasMinRole } = useAuthStore.getState();

    expect(hasMinRole("viewer")).toBe(true); // staff >= viewer
    expect(hasMinRole("staff")).toBe(true); // 同等
    expect(hasMinRole("admin")).toBe(false); // staff < admin
    expect(hasMinRole("owner")).toBe(false);
  });

  it("hasMinRole: owner は admin 以下を満たすが super_admin は満たさない", () => {
    useAuthStore.getState().setUser(makeUser("owner"));
    const { hasMinRole } = useAuthStore.getState();

    expect(hasMinRole("admin")).toBe(true);
    expect(hasMinRole("owner")).toBe(true);
    expect(hasMinRole("super_admin")).toBe(false);
  });

  it("hasMinRole: ユーザー未ログイン時は常に false", () => {
    expect(useAuthStore.getState().hasMinRole("viewer")).toBe(false);
  });

  it("setSelectedStore は店舗情報を保持", () => {
    useAuthStore.getState().setSelectedStore({ id: "s1", name: "新宿店" });
    expect(useAuthStore.getState().selectedStore).toEqual({
      id: "s1",
      name: "新宿店",
    });
  });
});
