"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  Download,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  issuedAt: string;
  paidAt: string | null;
}

const plans = [
  {
    name: "FREE",
    label: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 100 customers", "Basic analytics", "1 team member", "Community support"],
  },
  {
    name: "PRO",
    label: "Pro",
    price: "$99",
    period: "/month",
    popular: true,
    features: [
      "Up to 1,000 customers",
      "Advanced analytics & AI insights",
      "Up to 10 team members",
      "Priority support",
      "CSV exports",
      "Custom integrations",
    ],
  },
  {
    name: "ENTERPRISE",
    label: "Enterprise",
    price: "$299",
    period: "/month",
    features: [
      "Unlimited customers",
      "Full AI suite & custom models",
      "Unlimited team members",
      "Dedicated account manager",
      "SSO & SAML",
      "SLA guarantee",
      "Custom contracts",
    ],
  },
];

const invoiceStatusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  PENDING: "secondary",
  OVERDUE: "destructive",
};

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [changePlan, setChangePlan] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        fetch("/api/billing/subscription"),
        fetch("/api/billing/invoices"),
      ]);

      if (subRes.ok) {
        const data = await subRes.json() as {
          subscription: Subscription | null;
          currentPlan: string;
        };
        setCurrentPlan(data.currentPlan);
        setSubscription(data.subscription);
      }

      if (invRes.ok) {
        const data = await invRes.json() as { invoices: Invoice[] };
        setInvoices(data.invoices);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBilling();
  }, [fetchBilling]);

  async function handlePlanChange() {
    if (!changePlan) return;
    setChanging(true);
    try {
      const res = await fetch("/api/billing/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: changePlan }),
      });

      if (res.ok) {
        const data = await res.json() as { currentPlan: string; subscription: Subscription };
        setCurrentPlan(data.currentPlan);
        setSubscription(data.subscription);
        addToast({
          title: "Plan Updated",
          description: `Successfully changed to ${changePlan} plan.`,
        });
      } else {
        const err = await res.json() as { error: string };
        addToast({
          title: "Error",
          description: err.error,
          variant: "destructive",
        });
      }
    } finally {
      setChanging(false);
      setChangePlan(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and invoices</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /><Skeleton className="mt-4 h-4 w-full" /><Skeleton className="mt-2 h-4 w-3/4" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name;
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative",
                plan.popular && "border-primary shadow-md"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.label}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setChangePlan(plan.name)}
                  >
                    {plans.findIndex((p) => p.name === currentPlan) <
                    plans.findIndex((p) => p.name === plan.name)
                      ? "Upgrade"
                      : "Downgrade"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Subscription Details */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Subscription Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-semibold">{currentPlan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
                {subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Billing Date</p>
              <p className="font-semibold">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/billing/invoices/export", "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Issued</TableHead>
                <TableHead className="hidden sm:table-cell">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => setDetailInvoice(invoice)}
                  >
                    <TableCell className="font-mono text-xs">
                      {invoice.id.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoiceStatusVariant[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {new Date(invoice.issuedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {invoice.paidAt
                        ? new Date(invoice.paidAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plan Change Confirmation Dialog */}
      <Dialog open={!!changePlan} onOpenChange={() => setChangePlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              You are about to change your plan from <strong>{currentPlan}</strong> to{" "}
              <strong>{changePlan}</strong>. This will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">New Plan: {changePlan}</p>
            <p className="text-sm text-muted-foreground">
              Price: {plans.find((p) => p.name === changePlan)?.price ?? ""}
              {plans.find((p) => p.name === changePlan)?.period ?? ""}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlan(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handlePlanChange()} disabled={changing}>
              {changing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {changing ? "Processing..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!detailInvoice} onOpenChange={() => setDetailInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {detailInvoice && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice ID</p>
                  <p className="font-mono text-sm">{detailInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold">${detailInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={invoiceStatusVariant[detailInvoice.status]}>
                    {detailInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="text-sm">
                    {new Date(detailInvoice.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {detailInvoice.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Date</p>
                    <p className="text-sm">
                      {new Date(detailInvoice.paidAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailInvoice(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
