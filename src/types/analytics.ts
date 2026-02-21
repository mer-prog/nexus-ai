export interface AnalyticsKPI {
  mrr: number;
  newCustomers: number;
  churnRate: number;
  nrr: number;
  totalRevenue: number;
  activeCustomers: number;
}

export interface RevenueTimelinePoint {
  month: string;
  revenue: number;
}

export interface StatusDistributionPoint {
  name: string;
  value: number;
  fill: string;
}

export interface DailyActivePoint {
  date: string;
  users: number;
}

export interface AnalyticsResponse {
  kpi: AnalyticsKPI;
  revenueTimeline: RevenueTimelinePoint[];
  statusDistribution: StatusDistributionPoint[];
  dailyActive: DailyActivePoint[];
  period: number;
}
