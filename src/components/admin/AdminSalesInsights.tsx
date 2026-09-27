import { CheckCircle2, Clock, UserPlus, XCircle } from "lucide-react";
import IconStatCard from "./IconStatCard";
import MetricBarChart, { type MetricBarDatum } from "./MetricBarChart";
import RatioRing from "./RatioRing";

// Sales — Lead Insights: the stat-box row from the requirements doc, now
// with a pipeline bar chart and a conversion-rate ring alongside it. All
// numbers come straight from admin-dashboard's metrics, which buckets
// consultancy_requests by its `status` column (open / converted / lost). A
// project created from a lead (see admin-execution's create_project) marks
// that lead converted automatically.
const AdminSalesInsights = ({
  metrics,
}: {
  metrics: { leadsGenerated: number; leadsOpen: number; leadsConverted: number; leadsLost: number };
}) => {
  const pipeline: MetricBarDatum[] = [
    { label: "Generated", value: metrics.leadsGenerated, role: "neutral" },
    { label: "In Progress", value: metrics.leadsOpen, role: "progress" },
    { label: "Converted", value: metrics.leadsConverted, role: "success" },
    { label: "Lost", value: metrics.leadsLost, role: "critical" },
  ];

  return (
    <div className="mb-12">
      <h2 className="mb-4 font-serif text-2xl">Lead Insights</h2>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <IconStatCard icon={UserPlus} label="Leads Generated" value={metrics.leadsGenerated} role="neutral" />
        <IconStatCard icon={Clock} label="In Progress" value={metrics.leadsOpen} role="progress" />
        <IconStatCard icon={CheckCircle2} label="Converted" value={metrics.leadsConverted} role="success" />
        <IconStatCard icon={XCircle} label="Lost" value={metrics.leadsLost} role="critical" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Pipeline</p>
          <MetricBarChart data={pipeline} />
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
          <RatioRing value={metrics.leadsConverted} total={metrics.leadsGenerated} label="Conversion Rate" role="success" />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        A lead's status is set from the Consultancy Requests list; converting one into a project (Execution tab)
        marks it Converted automatically.
      </p>
    </div>
  );
};

export default AdminSalesInsights;
