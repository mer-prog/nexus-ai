export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "ACTIVE" | "INACTIVE" | "CHURNED";
  organizationId: string;
  createdAt: string;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
