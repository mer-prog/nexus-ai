"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomerPagination } from "@/components/customers/customer-pagination";
import { useCustomers } from "@/hooks/use-customers";
import { useT } from "@/hooks/use-translations";
import type { Customer } from "@/types/customer";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const t = useT("customers");

  // Simple debounce for search
  useMemo(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const {
    customers,
    pagination,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers({
    page,
    search: debouncedSearch,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function handleEdit(customer: Customer) {
    setEditingCustomer(customer);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingCustomer(null);
    setDialogOpen(true);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
    } else {
      await createCustomer(data);
    }
  }

  async function handleDelete(id: string) {
    await deleteCustomer(id);
  }

  function handleStatusFilter(value: string) {
    setStatusFilter(value === "ALL" ? "" : value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addCustomer")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("customerList")}</CardTitle>
          <CardDescription>
            {t("totalCustomers", { count: pagination.total })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={statusFilter || "ALL"} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
                  <SelectItem value="INACTIVE">{t("statusInactive")}</SelectItem>
                  <SelectItem value="CHURNED">{t("statusChurned")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{t("loadingCustomers")}</div>
          ) : (
            <CustomerTable
              customers={customers}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          <CustomerPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
