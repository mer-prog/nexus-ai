import { describe, it, expect, beforeEach } from "vitest";
import { useUserRoleStore } from "@/hooks/use-user-role";

describe("useUserRoleStore", () => {
  beforeEach(() => {
    useUserRoleStore.setState({ role: "MEMBER" });
  });

  it("has default role of MEMBER", () => {
    expect(useUserRoleStore.getState().role).toBe("MEMBER");
  });

  it("updates role via setRole", () => {
    useUserRoleStore.getState().setRole("ADMIN");
    expect(useUserRoleStore.getState().role).toBe("ADMIN");
  });

  it("updates role to MANAGER", () => {
    useUserRoleStore.getState().setRole("MANAGER");
    expect(useUserRoleStore.getState().role).toBe("MANAGER");
  });

  it("allows multiple role changes", () => {
    const store = useUserRoleStore.getState();
    store.setRole("ADMIN");
    expect(useUserRoleStore.getState().role).toBe("ADMIN");
    store.setRole("MEMBER");
    expect(useUserRoleStore.getState().role).toBe("MEMBER");
  });
});
