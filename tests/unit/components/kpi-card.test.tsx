import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DollarSign } from "lucide-react";

describe("KpiCard", () => {
  const defaultProps = {
    title: "Revenue",
    value: "$12,345",
    change: "+12%",
    trend: "up" as const,
    icon: DollarSign,
    description: "from last month",
  };

  it("renders title, value, and description", () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$12,345")).toBeInTheDocument();
    expect(screen.getByText("from last month")).toBeInTheDocument();
  });

  it("renders the change value", () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("applies green color for positive trend (non-churn)", () => {
    render(<KpiCard {...defaultProps} />);
    const changeEl = screen.getByText("+12%");
    expect(changeEl).toHaveClass("text-emerald-600");
  });

  it("applies red color for negative trend (non-churn)", () => {
    render(<KpiCard {...defaultProps} trend="down" change="-5%" />);
    const changeEl = screen.getByText("-5%");
    expect(changeEl).toHaveClass("text-red-600");
  });

  it("inverts colors for Churn Rate (down is good)", () => {
    render(
      <KpiCard
        {...defaultProps}
        title="Churn Rate"
        trend="down"
        change="-2%"
      />
    );
    const changeEl = screen.getByText("-2%");
    expect(changeEl).toHaveClass("text-emerald-600");
  });

  it("shows red for Churn Rate going up", () => {
    render(
      <KpiCard
        {...defaultProps}
        title="Churn Rate"
        trend="up"
        change="+3%"
      />
    );
    const changeEl = screen.getByText("+3%");
    expect(changeEl).toHaveClass("text-red-600");
  });
});
