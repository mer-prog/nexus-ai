import { describe, it, expect } from "vitest";
import { getMockAIResponse, getAnalysisResponse } from "@/lib/ai-mock";

describe("getMockAIResponse", () => {
  it("returns revenue-related response for revenue keywords", () => {
    const response = getMockAIResponse("What is my revenue?");
    expect(response).toContain("MRR");
    expect(response).toContain("revenue");
  });

  it("returns churn-related response for churn keywords", () => {
    const response = getMockAIResponse("What is my churn rate?");
    expect(response).toContain("Churn");
    expect(response).toContain("At-Risk");
  });

  it("returns customer-related response for customer keywords", () => {
    const response = getMockAIResponse("Tell me about my customers");
    expect(response).toContain("Total Customers");
  });

  it("returns team-related response for team keywords", () => {
    const response = getMockAIResponse("How is my team performing?");
    expect(response).toContain("Team Overview");
  });

  it("returns billing-related response for billing keywords", () => {
    const response = getMockAIResponse("Show my billing status");
    expect(response).toContain("Invoice Status");
  });

  it("returns help response for help keywords", () => {
    const response = getMockAIResponse("What can you help me with?");
    expect(response).toContain("Analytics & Insights");
  });

  it("returns default response for unmatched input", () => {
    const response = getMockAIResponse("random gibberish xyz");
    expect(response).toContain("Thank you for your question");
  });

  it("matches keywords case-insensitively", () => {
    const response = getMockAIResponse("REVENUE analysis");
    expect(response).toContain("MRR");
  });
});

describe("getAnalysisResponse", () => {
  it("generates a report with KPI data", () => {
    const report = getAnalysisResponse({
      mrr: 5000,
      newCustomers: 10,
      churnRate: 2.4,
      nrr: 105.2,
      totalRevenue: 60000,
      activeCustomers: 35,
    });

    expect(report).toContain("AI Analysis Report");
    expect(report).toContain("5,000");
    expect(report).toContain("60,000");
    expect(report).toContain("35");
    expect(report).toContain("2.4%");
    expect(report).toContain("105.2%");
    expect(report).toContain("within healthy range");
    expect(report).toContain("Excellent");
  });

  it("warns about high churn rate", () => {
    const report = getAnalysisResponse({
      mrr: 1000,
      newCustomers: 2,
      churnRate: 8.5,
      nrr: 95,
      totalRevenue: 12000,
      activeCustomers: 10,
    });

    expect(report).toContain("needs attention");
    expect(report).toContain("upsell opportunities");
  });
});
