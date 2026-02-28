"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useT } from "@/hooks/use-translations";
import { useFormat } from "@/hooks/use-format";
import type { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  CHURNED: "destructive",
};

const statusKeyMap: Record<string, string> = {
  ACTIVE: "statusActive",
  INACTIVE: "statusInactive",
  CHURNED: "statusChurned",
};

export function CustomerTable({
  customers,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const t = useT("customers");
  const tc = useT("common");
  const { formatDate } = useFormat();

  function SortButton({ field, children }: { field: string; children: React.ReactNode }) {
    const isActive = sortBy === field;
    return (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {children}
        <ArrowUpDown className={`h-3 w-3 ${isActive ? "text-foreground" : "opacity-50"}`} />
        {isActive && <span className="sr-only">{sortOrder === "asc" ? t("ascending") : t("descending")}</span>}
      </button>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">{t("name")}</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="email">{t("email")}</SortButton>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <SortButton field="company">{t("company")}</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">{t("status")}</SortButton>
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <SortButton field="createdAt">{t("created")}</SortButton>
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                {t("noCustomers")}
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {customer.company ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[customer.status]}>
                    {t(statusKeyMap[customer.status] ?? "statusActive")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{tc("actions")}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {tc("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(customer)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {tc("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteCustomer")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              {tc("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
