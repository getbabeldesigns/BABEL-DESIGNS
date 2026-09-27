import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AdminProjectSummary, AdminTeamMember } from "@/integrations/supabase/admin";
import { PROJECT_STAGES, createProject, stageLabel, updateProject, type ProjectStage } from "@/integrations/supabase/execution";
import ProjectDetail from "./ProjectDetail";

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

const emptyForm = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  projectName: "",
  ownerUserId: "",
  assignedMailbox: "",
  tentativeStartDate: "",
  tentativeHandoverDate: "",
};

// Execution — the Projects list from the requirements doc, plus a
// drill-into-one-project detail view (ProjectDetail) that bundles Summary,
// Notes, Timeline and Documents together, since Summary is just an
// auto-updating read of the other three.
const AdminExecution = ({
  projects,
  teamMembers,
  onChanged,
}: {
  projects: AdminProjectSummary[];
  teamMembers: AdminTeamMember[];
  onChanged: () => void;
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const teamById = new Map(teamMembers.map((member) => [member.id, member.name]));

  const createMutation = useMutation({
    mutationFn: () =>
      createProject({
        clientName: form.clientName,
        clientPhone: form.clientPhone || undefined,
        clientEmail: form.clientEmail || undefined,
        projectName: form.projectName,
        ownerUserId: form.ownerUserId || undefined,
        assignedMailbox: form.assignedMailbox || undefined,
        tentativeStartDate: form.tentativeStartDate || undefined,
        tentativeHandoverDate: form.tentativeHandoverDate || undefined,
      }),
    onSuccess: () => {
      toast.success("Project created.");
      setForm(emptyForm);
      setShowCreateForm(false);
      onChanged();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create project."),
  });

  const stageMutation = useMutation({
    mutationFn: ({ projectId, stage }: { projectId: string; stage: ProjectStage }) => updateProject(projectId, { stage }),
    onSuccess: () => {
      toast.success("Stage updated.");
      onChanged();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update stage."),
  });

  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        teamMembers={teamMembers}
        onBack={() => setSelectedProjectId(null)}
        onChanged={onChanged}
      />
    );
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Projects</h2>
        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
        >
          {showCreateForm ? "Cancel" : "New Project"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              placeholder="Client name"
              className="border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={form.projectName}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              placeholder="Project name"
              className="border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={form.clientPhone}
              onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
              placeholder="Client phone"
              className="border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={form.clientEmail}
              onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
              placeholder="Client email"
              className="border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={form.ownerUserId}
              onChange={(e) => setForm((f) => ({ ...f, ownerUserId: e.target.value }))}
              className="border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Project owner...</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            <input
              value={form.assignedMailbox}
              onChange={(e) => setForm((f) => ({ ...f, assignedMailbox: e.target.value }))}
              placeholder="Team mailbox assigned to this client"
              className="border border-border bg-background px-3 py-2 text-sm"
            />
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Tentative start</label>
              <input
                type="date"
                value={form.tentativeStartDate}
                onChange={(e) => setForm((f) => ({ ...f, tentativeStartDate: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Tentative handover</label>
              <input
                type="date"
                value={form.tentativeHandoverDate}
                onChange={(e) => setForm((f) => ({ ...f, tentativeHandoverDate: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.clientName || !form.projectName || createMutation.isPending}
            className="mt-4 border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-left">Stage</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">Handover</th>
              <th className="p-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No projects yet.</td></tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-border">
                <td className="p-3">{project.client_name}</td>
                <td className="p-3">{project.project_name}</td>
                <td className="p-3">
                  <select
                    defaultValue={project.stage}
                    onChange={(e) => stageMutation.mutate({ projectId: project.id, stage: e.target.value as ProjectStage })}
                    className="border border-border bg-background px-2 py-1"
                  >
                    {PROJECT_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{project.owner_user_id ? teamById.get(project.owner_user_id) ?? "-" : "-"}</td>
                <td className="p-3">{formatDate(project.tentative_start_date)}</td>
                <td className="p-3">{formatDate(project.tentative_handover_date)}</td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className="border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{stageLabel("just_started")} is the default stage for a new project.</p>
    </div>
  );
};

export default AdminExecution;
