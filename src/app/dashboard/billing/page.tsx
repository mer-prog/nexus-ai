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
import { useT } from "@/hooks/use-translations";
import { useFormat } from "@/hooks/use-format";
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
  const t = useT("billing");
  const tc = useT("common");
  const { formatCurrency, formatDate, formatDateLong } = useFormat();

  const planLabelMap: Record<string, string> = {
    FREE: t("planFree"),
    PRO: t("planPro"),
    ENTERPRISE: t("planEnterprise"),
  };

  const planPeriodMap: Record<string, string> = {
    FREE: t("forever"),
    PRO: t("perMonth"),
    ENTERPRISE: t("perMonth"),
  };

  const planPrices: Record<string, number> = {
    FREE: 0,
    PRO: 99,
    ENTERPRISE: 299,
  };

  function getFeatures(plan: string): string[] {
    const features = t(`features.${plan.toLowerCase()}`) as unknown;
    if (Array.isArray(features)) return features as string[];
    return [];
  }

  const plans = [
    { name: "FREE", popular: false },
    { name: "PRO", popular: true },
    { name: "ENTERPRISE", popular: false },
  ];

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
          title: t("planUpdated"),
          description: t("planUpdatedDesc", { plan: planLabelMap[changePlan] ?? changePlan }),
        });
      } else {
        const err = await res.json() as { error: string };
        addToast({
          title: tc("error"),
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
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
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
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name;
          const price = planPrices[plan.name] ?? 0;
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
                  <Badge>{t("mostPopular")}</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{planLabelMap[plan.name]}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{price === 0 ? "$0" : formatCurrency(price)}</span>
                  <span className="text-muted-foreground">{planPeriodMap[plan.name]}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getFeatures(plan.name).map((feature) => (
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
                    {t("currentPlan")}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setChangePlan(plan.name)}
                  >
                    {plans.findIndex((p) => p.name === currentPlan) <
                    plans.findIndex((p) => p.name === plan.name)
                      ? t("upgrade")
                      : t("downgrade")}
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
              <CardTitle>{t("subscriptionDetails")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t("currentPlan")}</p>
              <p className="font-semibold">{planLabelMap[currentPlan] ?? currentPlan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"}>
                {subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("nextBillingDate")}</p>
              <p className="font-semibold">
                {formatDateLong(subscription.currentPeriodEnd)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("invoiceHistory")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/billing/invoices/export", "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("exportCsv")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoiceId")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("issued")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("paid")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("noInvoices")}
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
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoiceStatusVariant[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(invoice.issuedAt)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {invoice.paidAt
                        ? formatDate(invoice.paidAt)
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
            <DialogTitle>{t("confirmPlanChange")}</DialogTitle>
            <DialogDescription>
              {t("planChangeDesc", {
                currentPlan: planLabelMap[currentPlan] ?? currentPlan,
                newPlan: planLabelMap[changePlan ?? ""] ?? changePlan ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">{t("newPlan", { plan: planLabelMap[changePlan ?? ""] ?? changePlan ?? "" })}</p>
            <p className="text-sm text-muted-foreground">
              {t("price", {
                price: changePlan ? (planPrices[changePlan] === 0 ? "$0" : formatCurrency(planPrices[changePlan] ?? 0)) : "",
                period: planPeriodMap[changePlan ?? ""] ?? "",
              })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlan(null)}>
              {tc("cancel")}
            </Button>
            <Button onClick={() => void handlePlanChange()} disabled={changing}>
              {changing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {changing ? tc("processing") : t("confirmChange")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!detailInvoice} onOpenChange={() => setDetailInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("invoiceDetails")}</DialogTitle>
          </DialogHeader>
          {detailInvoice && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("invoiceId")}</p>
                  <p className="font-mono text-sm">{detailInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("amount")}</p>
                  <p className="text-lg font-bold">{formatCurrency(detailInvoice.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("status")}</p>
                  <Badge variant={invoiceStatusVariant[detailInvoice.status]}>
                    {detailInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("issuedDate")}</p>
                  <p className="text-sm">
                    {formatDateLong(detailInvoice.issuedAt)}
                  </p>
                </div>
                {detailInvoice.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("paidDate")}</p>
                    <p className="text-sm">
                      {formatDateLong(detailInvoice.paidAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailInvoice(null)}>
              {tc("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
