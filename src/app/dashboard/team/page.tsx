"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Users, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTable } from "@/components/team/team-table";
import { InviteDialog } from "@/components/team/invite-dialog";
import { useT } from "@/hooks/use-translations";
import type { TeamResponse } from "@/types/team";

const roleKeyMap: Record<string, string> = {
  ADMIN: "roleAdmin",
  MANAGER: "roleManager",
  MEMBER: "roleMember",
};

export default function TeamPage() {
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const t = useT("team");

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.status === 403) {
        setError(t("noPermission"));
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch team");
      const json: TeamResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchTeam();
  }, [fetchTeam]);

  async function handleRoleChange(id: string, role: string) {
    const res = await fetch(`/api/team/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to update role");
    }
    await fetchTeam();
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to remove member");
    }
    await fetchTeam();
  }

  async function handleInvite(email: string, role: string) {
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to invite member");
    }
    await fetchTeam();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("contactAdmin")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = data?.currentUserRole === "ADMIN";
  const adminCount = data?.members.filter((m) => m.role === "ADMIN").length ?? 0;
  const memberCount = data?.members.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("inviteMember")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalMembers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admins")}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("yourRole")}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.currentUserRole ? t(roleKeyMap[data.currentUserRole] ?? "roleMember") : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("members")}</CardTitle>
          <CardDescription>
            {isAdmin
              ? t("manageRoles")
              : t("viewTeam")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{t("loadingTeam")}</div>
          ) : data ? (
            <TeamTable
              members={data.members}
              currentUserId={data.currentUserId}
              isAdmin={isAdmin}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
            />
          ) : null}
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </div>
  );
}
