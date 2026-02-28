"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/hooks/use-translations";
import { useFormat } from "@/hooks/use-format";
import type { TeamMember } from "@/types/team";

interface TeamTableProps {
  members: TeamMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRoleChange: (id: string, role: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  MEMBER: "secondary",
};

const roleKeyMap: Record<string, string> = {
  ADMIN: "roleAdmin",
  MANAGER: "roleManager",
  MEMBER: "roleMember",
};

export function TeamTable({
  members,
  currentUserId,
  isAdmin,
  onRoleChange,
  onRemove,
}: TeamTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const t = useT("team");
  const tc = useT("common");
  const { formatDate } = useFormat();

  async function handleRoleChange(memberId: string, role: string) {
    setUpdatingRole(memberId);
    try {
      await onRoleChange(memberId, role);
    } finally {
      setUpdatingRole(null);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("member")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("joined")}</TableHead>
            {isAdmin && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{member.name}</span>
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">{t("you")}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  {isAdmin && !isSelf ? (
                    <Select
                      value={member.role}
                      onValueChange={(role) => handleRoleChange(member.id, role)}
                    >
                      <SelectTrigger
                        className={`w-[130px] ${updatingRole === member.id ? "opacity-50" : ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                        <SelectItem value="MANAGER">{t("roleManager")}</SelectItem>
                        <SelectItem value="MEMBER">{t("roleMember")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={roleBadgeVariant[member.role]}>
                      {member.role === "ADMIN" && <Shield className="mr-1 h-3 w-3" />}
                      {t(roleKeyMap[member.role] ?? "roleMember")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(member.createdAt)}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {!isSelf && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{tc("actions")}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTeamMember")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeConfirm", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await onRemove(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
