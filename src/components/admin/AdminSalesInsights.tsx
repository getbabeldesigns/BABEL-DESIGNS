// Sales — Lead Insights: the stat-box row from the requirements doc. Purely
// presentational — the counts come from admin-dashboard's metrics, which
// buckets consultancy_requests by its `status` column (open / converted /
// lost). A project created from a lead (see admin-execution's
// create_project) marks that lead converted automatically.
const AdminSalesInsights = ({
  metrics,
}: {
  metrics: { leadsGenerated: number; leadsOpen: number; leadsConverted: number; leadsLost: number };
}) => {
  const boxes = [
    { label: "Leads Generated", value: metrics.leadsGenerated },
    { label: "In Progress", value: metrics.leadsOpen },
    { label: "Converted", value: metrics.leadsConverted },
    { label: "Lost", value: metrics.leadsLost },
  ];

  return (
    <div className="mb-12">
      <h2 className="font-serif text-2xl mb-4">Lead Insights</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {boxes.map((box) => (
          <div key={box.label} className="border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{box.label}</p>
            <p className="mt-2 font-serif text-3xl">{box.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A lead's status is set from the Consultancy Requests list; converting one into a project (Execution tab)
        marks it Converted automatically.
      </p>
    </div>
  );
};

export default AdminSalesInsights;
