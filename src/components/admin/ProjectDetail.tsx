import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AdminTeamMember } from "@/integrations/supabase/admin";
import {
  PROJECT_STAGES,
  addProjectDocumentLink,
  addProjectInspirationLink,
  addProjectNote,
  addProjectTask,
  deleteProjectInspiration,
  fetchProjectDetail,
  getProjectDocumentUrl,
  updateProject,
  updateProjectTask,
  uploadProjectDocument,
  uploadProjectInspirationImage,
  type ProjectStage,
} from "@/integrations/supabase/execution";
import { accentBorder, accentText, projectStageAccent, type AccentRole } from "@/lib/statusColors";

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "-");
const formatDateTime = (value: string) => new Date(value).toLocaleString();

const BUCKET_LABELS: Record<string, string> = {
  delayed: "Delayed",
  current: "Due Soon",
  upcoming: "Upcoming",
  done: "Done",
};

const BUCKET_ACCENT: Record<string, AccentRole> = {
  delayed: "critical",
  current: "caution",
  upcoming: "progress",
  done: "success",
};

// Project Summary + Notes + Timeline + Documents, combined — Summary is
// deliberately not its own fetch: it's just the stage/dates/counts already
// in this same bundle, read straight off admin-project-detail's response.
const ProjectDetail = ({
  projectId,
  teamMembers,
  onBack,
  onChanged,
}: {
  projectId: string;
  teamMembers: AdminTeamMember[];
  onBack: () => void;
  onChanged: () => void;
}) => {
  const queryClient = useQueryClient();
  const queryKey = ["project-detail", projectId];
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => fetchProjectDetail(projectId) });

  const [noteBody, setNoteBody] = useState("");
  const [noteMentions, setNoteMentions] = useState<string[]>([]);
  const [noteClientVisible, setNoteClientVisible] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskClientVisible, setTaskClientVisible] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [docFolder, setDocFolder] = useState("General");
  const [uploading, setUploading] = useState(false);

  const [inspLinkUrl, setInspLinkUrl] = useState("");
  const [inspCaption, setInspCaption] = useState("");
  const [inspUploading, setInspUploading] = useState(false);

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey });
    onChanged();
  };

  const stageMutation = useMutation({
    mutationFn: (stage: ProjectStage) => updateProject(projectId, { stage }),
    onSuccess: () => { toast.success("Stage updated."); refetchAll(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update stage."),
  });

  const noteMutation = useMutation({
    mutationFn: () => addProjectNote({ projectId, body: noteBody, mentionedUserIds: noteMentions, clientVisible: noteClientVisible }),
    onSuccess: () => {
      toast.success(noteMentions.length ? "Note added — mentioned teammates have been emailed." : "Note added.");
      setNoteBody(""); setNoteMentions([]); setNoteClientVisible(false);
      refetchAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add note."),
  });

  const taskMutation = useMutation({
    mutationFn: () => addProjectTask({ projectId, title: taskTitle, dueDate: taskDueDate, assigneeUserId: taskAssignee || undefined, clientVisible: taskClientVisible }),
    onSuccess: () => {
      toast.success("Task added.");
      setTaskTitle(""); setTaskDueDate(""); setTaskAssignee(""); setTaskClientVisible(false);
      refetchAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add task."),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, done }: { taskId: string; done: boolean }) => updateProjectTask(taskId, { done }),
    onSuccess: refetchAll,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update task."),
  });

  const addLinkMutation = useMutation({
    mutationFn: () => addProjectDocumentLink({ projectId, url: linkUrl, fileName: linkName || undefined, folder: docFolder }),
    onSuccess: () => {
      toast.success("Link added.");
      setLinkUrl(""); setLinkName("");
      refetchAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add link."),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadProjectDocument({ projectId, file, folder: docFolder });
      toast.success("File uploaded.");
      refetchAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = async (documentId: string) => {
    try {
      const result = await getProjectDocumentUrl(documentId);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open document.");
    }
  };

  const addInspirationLinkMutation = useMutation({
    mutationFn: () => addProjectInspirationLink({ projectId, url: inspLinkUrl, caption: inspCaption || undefined }),
    onSuccess: () => {
      toast.success("Added to the inspiration board.");
      setInspLinkUrl(""); setInspCaption("");
      refetchAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add that."),
  });

  const deleteInspirationMutation = useMutation({
    mutationFn: (inspirationId: string) => deleteProjectInspiration(inspirationId),
    onSuccess: refetchAll,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete."),
  });

  const handleInspirationUpload = async (file: File) => {
    setInspUploading(true);
    try {
      await uploadProjectInspirationImage({ projectId, file, caption: inspCaption || undefined });
      toast.success("Added to the inspiration board.");
      setInspCaption("");
      refetchAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setInspUploading(false);
    }
  };

  if (isLoading || !data) {
    return <div className="mb-12 text-sm text-muted-foreground">Loading project...</div>;
  }

  const { project, notes, tasks, timelineSummary, documents, inspiration } = data;
  const bucketOrder: (keyof typeof timelineSummary)[] = ["delayed", "current", "upcoming", "done"];
  const documentsByFolder = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    (acc[doc.folder] ??= []).push(doc);
    return acc;
  }, {});

  return (
    <div className="mb-12">
      <button onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
        ← Back to Projects
      </button>

      {/* Summary */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">{project.project_name}</h2>
            <p className="text-sm text-muted-foreground">{project.client_name} · {project.client_email ?? "no email"} · {project.client_phone ?? "no phone"}</p>
          </div>
          <select
            defaultValue={project.stage}
            onChange={(e) => stageMutation.mutate(e.target.value as ProjectStage)}
            className={`border bg-background px-3 py-2 text-sm font-medium ${accentBorder(projectStageAccent(project.stage))} ${accentText(projectStageAccent(project.stage))}`}
          >
            {PROJECT_STAGES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-6">
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Start</p><p>{formatDate(project.tentative_start_date)}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Handover</p><p>{formatDate(project.tentative_handover_date)}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delayed</p><p className={`font-medium ${accentText("critical")}`}>{timelineSummary.delayed}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Due Soon</p><p className={`font-medium ${accentText("caution")}`}>{timelineSummary.current}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Upcoming</p><p className={`font-medium ${accentText("progress")}`}>{timelineSummary.upcoming}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</p><p>{notes.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Notes */}
        <div>
          <h3 className="font-serif text-xl mb-3">Notes</h3>
          <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mb-2 flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={noteMentions.includes(member.id)}
                    onChange={(e) =>
                      setNoteMentions((prev) => (e.target.checked ? [...prev, member.id] : prev.filter((id) => id !== member.id)))
                    }
                  />
                  @{member.name}
                </label>
              ))}
            </div>
            <label className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <input type="checkbox" checked={noteClientVisible} onChange={(e) => setNoteClientVisible(e.target.checked)} />
              Visible to client
            </label>
            <button
              onClick={() => noteMutation.mutate()}
              disabled={!noteBody.trim() || noteMutation.isPending}
              className="rounded-lg border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {noteMutation.isPending ? "Posting..." : "Post Note"}
            </button>
          </div>
          <div className="space-y-3">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{note.author_name}</span>
                  <span>{formatDateTime(note.created_at)}</span>
                </div>
                <p className="text-sm">{note.body}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {note.mentioned_names.map((name) => <span key={name}>@{name}</span>)}
                  {note.client_visible && <span className="uppercase tracking-[0.2em]">Client visible</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="font-serif text-xl mb-3">Timeline</h3>
          <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
              className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mb-2 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Assignee...</option>
                {teamMembers.map((member) => (<option key={member.id} value={member.id}>{member.name}</option>))}
              </select>
            </div>
            <label className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <input type="checkbox" checked={taskClientVisible} onChange={(e) => setTaskClientVisible(e.target.checked)} />
              Visible to client
            </label>
            <button
              onClick={() => taskMutation.mutate()}
              disabled={!taskTitle.trim() || !taskDueDate || taskMutation.isPending}
              className="rounded-lg border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {taskMutation.isPending ? "Adding..." : "Add Task"}
            </button>
          </div>
          <div className="space-y-4">
            {bucketOrder.map((bucket) => {
              const bucketTasks = tasks.filter((t) => t.bucket === bucket);
              if (bucketTasks.length === 0) return null;
              return (
                <div key={bucket}>
                  <p className={`mb-2 text-xs uppercase tracking-[0.25em] font-medium ${accentText(BUCKET_ACCENT[bucket])}`}>{BUCKET_LABELS[bucket]}</p>
                  <div className="space-y-2">
                    {bucketTasks.map((task) => (
                      <label key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={(e) => toggleTaskMutation.mutate({ taskId: task.id, done: e.target.checked })}
                          />
                          <span className={task.done ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(task.due_date)}{task.assignee_name ? ` · ${task.assignee_name}` : ""}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-8">
        <h3 className="font-serif text-xl mb-3">Documents</h3>
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <input
            value={docFolder}
            onChange={(e) => setDocFolder(e.target.value || "General")}
            placeholder="Folder (e.g. Drawings, Contracts)"
            className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm md:w-64"
          />
          <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Google Drive / external link"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Label (optional)"
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={() => addLinkMutation.mutate()}
                disabled={!linkUrl.trim() || addLinkMutation.isPending}
                className="rounded-lg border border-foreground/40 px-3 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
            <div>
              <input
                type="file"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleUpload(file);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
              />
              {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>}
            </div>
          </div>
        </div>

        {Object.keys(documentsByFolder).length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
        <div className="space-y-4">
          {Object.entries(documentsByFolder).map(([folder, docs]) => (
            <div key={folder}>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{folder}</p>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
                    <span>{doc.file_name} <span className="text-xs text-muted-foreground">({doc.kind})</span></span>
                    <button onClick={() => handleOpenDocument(doc.id)} className="text-xs uppercase tracking-[0.2em] underline">
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Portal — Inspiration board (two-way: client uploads show up
          here too, and this section's own additions show as "From Babel
          Design" on the client's side). */}
      <div className="mt-8">
        <h3 className="font-serif text-xl mb-3">Client Inspiration Board</h3>
        <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <input
            value={inspCaption}
            onChange={(e) => setInspCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm md:w-64"
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={inspLinkUrl}
                onChange={(e) => setInspLinkUrl(e.target.value)}
                placeholder="Pinterest / Instagram / image link"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={() => addInspirationLinkMutation.mutate()}
                disabled={!inspLinkUrl.trim() || addInspirationLinkMutation.isPending}
                className="rounded-lg border border-foreground/40 px-3 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={inspUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleInspirationUpload(file);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
              />
              {inspUploading && <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>}
            </div>
          </div>
        </div>

        {inspiration.length === 0 && <p className="text-sm text-muted-foreground">Nothing shared yet.</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {inspiration.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
              {item.kind === "image" ? (
                <img src={item.url} alt={item.caption ?? ""} className="aspect-square w-full object-cover" />
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex aspect-square w-full items-center justify-center p-3 text-center text-xs underline"
                >
                  {item.url}
                </a>
              )}
              <div className="flex items-center justify-between p-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {item.source === "admin" ? "From Us" : "From Client"}
                </p>
                <button
                  onClick={() => deleteInspirationMutation.mutate(item.id)}
                  className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
              {item.caption && <p className="px-2 pb-2 text-xs">{item.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
