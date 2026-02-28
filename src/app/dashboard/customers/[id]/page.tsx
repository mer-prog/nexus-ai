"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Building2, Calendar, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { useT } from "@/hooks/use-translations";
import { useFormat } from "@/hooks/use-format";
import type { Customer } from "@/types/customer";

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

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const t = useT("customers");
  const tc = useT("common");
  const { formatDateLong, formatDateTime } = useFormat();

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data: Customer = await res.json();
      setCustomer(data);
    } catch {
      router.push("/dashboard/customers");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void fetchCustomer();
  }, [fetchCustomer]);

  async function handleStatusChange(newStatus: string) {
    if (!customer || newStatus === customer.status) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated: Customer = await res.json();
        setCustomer(updated);
      }
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleEdit(data: Record<string, unknown>) {
    if (!customer) return;
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: Customer = await res.json();
      setCustomer(updated);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/customers")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">{tc("back")}</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground">{t("profileAndActivity")}</p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          {tc("edit")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
            <CardDescription>{t("profileDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.email}</span>
            </div>
            {customer.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.company}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t("joined", { date: formatDateLong(customer.createdAt) })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("statusManagement")}</CardTitle>
            <CardDescription>{t("statusManagementDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t("currentStatus")}</span>
              <Badge variant={statusVariant[customer.status]}>
                {t(statusKeyMap[customer.status] ?? "statusActive")}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">{t("changeStatus")}</span>
              <Select
                value={customer.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className={statusUpdating ? "opacity-50" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
                  <SelectItem value="INACTIVE">{t("statusInactive")}</SelectItem>
                  <SelectItem value="CHURNED">{t("statusChurned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("activityHistory")}</CardTitle>
          <CardDescription>{t("activityHistoryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">{t("customerCreated")}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(customer.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("status")}: {t(statusKeyMap[customer.status] ?? "statusActive")}</p>
                <p className="text-xs text-muted-foreground">{t("currentStatusLabel")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        onSubmit={handleEdit}
      />
    </div>
  );
}
