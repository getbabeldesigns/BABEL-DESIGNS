import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, type LeadStatus, updateLead } from "@/integrations/pocketbase/leads";
import { isPocketBaseConfigured } from "@/integrations/pocketbase/client";
import { toast } from "sonner";

const crmStorageKey = "babel_crm_token";
const leadStatuses: LeadStatus[] = ["new", "contacted", "qualified", "proposal_sent", "won", "lost"];

const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleString() : "-");

const CRM = () => {
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState(() => sessionStorage.getItem(crmStorageKey) ?? "");
  const [token, setToken] = useState(() => sessionStorage.getItem(crmStorageKey) ?? "");
  const [search, setSearch] = useState("");
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const expectedToken = import.meta.env.VITE_CRM_ACCESS_TOKEN;
  const tokenRequired = Boolean(expectedToken);
  const isAuthorized = !tokenRequired || token === expectedToken;

  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: fetchLeads,
    enabled: isPocketBaseConfigured && isAuthorized,
  });

  const saveLeadMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: LeadStatus; notes: string }) => updateLead(id, { status, notes }),
    onSuccess: () => {
      toast.success("Lead updated.");
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update lead.";
      toast.error(message);
    },
  });

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.projectType, lead.source, lead.status].join(" ").toLowerCase().includes(query),
    );
  }, [leads, search]);

  const saveToken = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = tokenInput.trim();
    sessionStorage.setItem(crmStorageKey, trimmed);
    setToken(trimmed);
    if (tokenRequired && trimmed !== expectedToken) {
      toast.error("Invalid CRM token.");
      return;
    }
    toast.success("CRM unlocked.");
  };

  const clearToken = () => {
    sessionStorage.removeItem(crmStorageKey);
    setToken("");
    setTokenInput("");
  };

  if (!isPocketBaseConfigured) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="mb-4 font-serif text-4xl">CRM Unavailable</h1>
            <p className="font-sans text-muted-foreground">Set `VITE_POCKETBASE_URL` to use CRM.</p>
          </div>
        </section>
      </div>
    );
  }

  if (tokenRequired && !isAuthorized) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial max-w-lg">
            <h1 className="mb-6 font-serif text-4xl">CRM Access</h1>
            <form onSubmit={saveToken} className="space-y-4 border border-border bg-card p-6">
              <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">CRM token</label>
              <input
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                className="w-full border border-border bg-background px-3 py-2"
                placeholder="Enter VITE_CRM_ACCESS_TOKEN"
              />
              <button className="w-full border border-foreground/40 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                Unlock CRM
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="font-serif text-4xl">Loading leads...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="mb-4 font-serif text-4xl">CRM unavailable</h1>
            <p className="mb-6 font-sans text-muted-foreground">Confirm PocketBase collection `leads` exists and access rules allow reads.</p>
            <button onClick={clearToken} className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]">
              Reset Token
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="font-serif text-4xl md:text-5xl">Lead CRM</h1>
            <div className="flex gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads"
                className="border border-border bg-background px-3 py-2 text-sm"
              />
              {tokenRequired && (
                <button onClick={clearToken} className="border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]">
                  Lock
                </button>
              )}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
            {leadStatuses.map((status) => (
              <div key={status} className="border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{status.replace("_", " ")}</p>
                <p className="mt-2 font-serif text-2xl">{filteredLeads.filter((lead) => lead.status === status).length}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="border border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl">{lead.name || "Unnamed Lead"}</p>
                    <p className="font-sans text-sm text-muted-foreground">{lead.email || "-"}</p>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {lead.source} • {formatDate(lead.createdAt)}
                    </p>
                  </div>
                  <select
                    className="border border-border bg-background px-2 py-1"
                    defaultValue={lead.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as LeadStatus;
                      saveLeadMutation.mutate({
                        id: lead.id,
                        status: nextStatus,
                        notes: draftNotes[lead.id] ?? lead.notes,
                      });
                    }}
                  >
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
                  <p>Phone: {lead.phone || "-"}</p>
                  <p>Project: {lead.projectType || "-"}</p>
                  <p>Timeline: {lead.timeline || "-"}</p>
                </div>
                {lead.message && <p className="mb-3 text-sm text-foreground/90">{lead.message}</p>}

                <textarea
                  value={draftNotes[lead.id] ?? lead.notes}
                  onChange={(event) => setDraftNotes((prev) => ({ ...prev, [lead.id]: event.target.value }))}
                  className="mb-3 w-full border border-border bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Internal notes"
                />
                <button
                  onClick={() =>
                    saveLeadMutation.mutate({
                      id: lead.id,
                      status: lead.status,
                      notes: draftNotes[lead.id] ?? lead.notes,
                    })
                  }
                  className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  Save Notes
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CRM;
