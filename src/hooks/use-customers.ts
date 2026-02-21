"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer, CustomersResponse } from "@/types/customer";

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const { page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", sortOrder = "desc" } = params;
  const [data, setData] = useState<CustomersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (search) queryParams.set("search", search);
      if (status) queryParams.set("status", status);

      const res = await fetch(`/api/customers?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const json: CustomersResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sortBy, sortOrder]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  async function createCustomer(customerData: Record<string, unknown>) {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create customer");
    }
    await fetchCustomers();
    return res.json() as Promise<Customer>;
  }

  async function updateCustomer(id: string, customerData: Record<string, unknown>) {
    const res = await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to update customer");
    }
    await fetchCustomers();
    return res.json() as Promise<Customer>;
  }

  async function deleteCustomer(id: string) {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to delete customer");
    }
    await fetchCustomers();
  }

  return {
    customers: data?.customers ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
