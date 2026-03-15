export type InsurerRole = "admin" | "member" | "viewer" | "auditor";

export type InsurerDashboardStats = {
  total_views: number;
  unique_certs: number;
  month_actions: number;
  recent_activity: { date: string; count: number }[];
  action_breakdown: { action: string; count: number }[];
  recent_certs: {
    public_id: string;
    customer_name: string;
    status: string;
    vehicle_info_json: Record<string, string> | null;
    viewed_at: string;
  }[];
};
