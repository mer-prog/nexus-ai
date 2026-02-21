interface MockResponse {
  keywords: string[];
  response: string;
}

const mockResponses: MockResponse[] = [
  {
    keywords: ["revenue", "mrr", "income", "sales", "earning"],
    response: `Based on your current data, here's my revenue analysis:\n\n**Key Findings:**\n- Your MRR has been growing steadily at approximately 8-12% month-over-month\n- The Pro plan tier is your strongest revenue driver, contributing ~45% of total MRR\n- Enterprise upgrades in the last quarter have accelerated growth\n\n**Recommendations:**\n1. Focus on converting Free tier users to Pro — your conversion rate is currently at 15%, industry average is 22%\n2. Consider offering annual billing discounts to reduce churn\n3. The Enterprise segment shows highest expansion revenue potential\n\nWould you like me to dive deeper into any specific area?`,
  },
  {
    keywords: ["churn", "retention", "leaving", "cancel", "lost"],
    response: `Here's your churn analysis:\n\n**Current Churn Rate:** 2.4% monthly\n\n**At-Risk Customers Identified:**\n- 3 customers haven't logged in for 30+ days\n- 2 customers have downgraded their plans recently\n- 1 customer has submitted multiple support tickets\n\n**Churn Patterns:**\n- Most churn occurs in months 3-6 after signup\n- Free-to-Pro converts have 40% lower churn than direct Pro signups\n- Customers who use AI features have 60% better retention\n\n**Action Items:**\n1. Implement a re-engagement email sequence for inactive users\n2. Offer a personalized onboarding call for new Pro subscribers\n3. Create an early warning system based on usage patterns`,
  },
  {
    keywords: ["customer", "user", "client", "account"],
    response: `Here's your customer overview:\n\n**Total Customers:** 50\n- Active: 35 (70%)\n- Inactive: 8 (16%)\n- Churned: 7 (14%)\n\n**Growth Trends:**\n- New customer acquisition is averaging 5-8 per month\n- Your best acquisition channel is organic search (42%)\n- Average customer lifetime value (CLV) is approximately $2,400\n\n**Segmentation Insights:**\n- Tech companies make up 60% of your customer base\n- Companies with 50-200 employees have the highest retention rate\n- The APAC region is your fastest-growing market\n\nWould you like me to create a detailed customer segmentation report?`,
  },
  {
    keywords: ["team", "member", "role", "performance", "employee"],
    response: `Here's your team performance summary:\n\n**Team Overview:**\n- Total members: 3 active across your organization\n- Role distribution: 1 Admin, 1 Manager, 1 Member\n\n**Activity Metrics:**\n- Average daily active team members: 2.3\n- Most active hours: 9 AM - 12 PM (local time)\n- Feature adoption rate: 78% of available features used\n\n**Recommendations:**\n1. Consider adding more team members as your customer base grows\n2. The Manager role could benefit from additional analytics permissions\n3. Regular team syncs on customer health metrics improve response times by 35%`,
  },
  {
    keywords: ["billing", "invoice", "payment", "subscription", "plan", "pricing"],
    response: `Here's your billing summary:\n\n**Current Plan:** Pro\n- Monthly cost: $99/month\n- Next renewal: March 15, 2026\n\n**Invoice Status:**\n- Paid: 20 invoices ($4,820 total)\n- Pending: 6 invoices ($1,290 total)\n- Overdue: 4 invoices ($890 total)\n\n**Insights:**\n- 87% on-time payment rate\n- Average invoice amount: $233\n- Consider switching to annual billing to save 16%\n\n**Action Items:**\n1. Follow up on 4 overdue invoices\n2. Review Enterprise plan benefits — your usage suggests you'd benefit from the upgrade\n3. Set up automated payment reminders for pending invoices`,
  },
  {
    keywords: ["help", "what can", "how to", "feature", "guide"],
    response: `I'm your AI assistant for Nexus AI! Here's what I can help you with:\n\n**Analytics & Insights**\n- Revenue trend analysis and forecasting\n- Customer churn prediction and prevention\n- Team performance metrics\n\n**Data Analysis**\n- KPI breakdown and anomaly detection\n- Customer segmentation analysis\n- Growth opportunity identification\n\n**Recommendations**\n- Actionable business suggestions\n- Best practices for SaaS growth\n- Optimization strategies\n\nTry asking me things like:\n- *"Analyze my revenue trends"*\n- *"Which customers are at risk of churning?"*\n- *"How is my team performing?"*\n- *"Review my billing status"*\n\nWhat would you like to explore?`,
  },
];

const defaultResponse = `Thank you for your question. Let me analyze your data...\n\n**Summary:**\nBased on the current metrics in your dashboard, your business is performing well overall. Here are some key observations:\n\n1. **Growth trajectory** is positive with consistent month-over-month improvements\n2. **Customer engagement** levels are above industry averages\n3. **Revenue per customer** has been steadily increasing\n\n**Suggestions:**\n- Monitor your churn rate closely — early intervention can save 30% of at-risk customers\n- Consider expanding your team to support the growing customer base\n- Review your pricing strategy quarterly to ensure market alignment\n\nWould you like me to focus on any specific aspect of your business?`;

export function getMockAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  for (const mock of mockResponses) {
    if (mock.keywords.some((kw) => lower.includes(kw))) {
      return mock.response;
    }
  }

  return defaultResponse;
}

export function getAnalysisResponse(kpiData: {
  mrr: number;
  newCustomers: number;
  churnRate: number;
  nrr: number;
  totalRevenue: number;
  activeCustomers: number;
}): string {
  return `# AI Analysis Report\n\n## Executive Summary\nI've analyzed your current business metrics and identified several key trends and opportunities.\n\n## KPI Breakdown\n\n### Revenue\n- **MRR: $${kpiData.mrr.toLocaleString()}** — This represents solid recurring revenue\n- **Total Revenue: $${kpiData.totalRevenue.toLocaleString()}** in the selected period\n- Revenue is trending upward, suggesting healthy business growth\n\n### Customer Health\n- **Active Customers: ${kpiData.activeCustomers}** — Your base is strong\n- **New Customers: ${kpiData.newCustomers}** added in this period\n- **Churn Rate: ${kpiData.churnRate}%** — ${kpiData.churnRate < 5 ? "This is within healthy range for SaaS" : "This needs attention — aim for under 5%"}\n\n### Retention\n- **Net Revenue Retention: ${kpiData.nrr}%** — ${kpiData.nrr > 100 ? "Excellent! You're expanding revenue from existing customers" : "Focus on upsell opportunities to push above 100%"}\n\n## Key Insights\n\n1. **Growth Driver**: Pro plan upgrades are the primary growth engine. Consider creating targeted upgrade campaigns for Free tier users.\n\n2. **Churn Prevention**: ${kpiData.churnRate < 3 ? "Your churn rate is excellent. Maintain current retention strategies." : "Implement an early-warning system to identify at-risk customers based on usage patterns."}\n\n3. **Revenue Optimization**: Your average revenue per customer could increase by 15-20% with strategic pricing tiers and feature gating.\n\n## Recommendations\n\n| Priority | Action | Expected Impact |\n|----------|--------|----------------|\n| High | Launch re-engagement campaign for inactive users | -1.5% churn reduction |\n| High | Introduce annual billing option | +12% revenue uplift |\n| Medium | Add customer health scoring | Earlier churn detection |\n| Medium | Optimize onboarding flow | +20% activation rate |\n| Low | Expand to new market segments | +25% addressable market |\n\n## Forecast\nBased on current trends, projected MRR for next quarter: **$${Math.round(kpiData.mrr * 1.15).toLocaleString()}** (+15% growth).\n\n---\n*This analysis was generated by Nexus AI based on your current dashboard data.*`;
}
