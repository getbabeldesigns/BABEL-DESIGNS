import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addClientInspirationLink,
  fetchClientProject,
  uploadClientInspirationImage,
} from "@/integrations/supabase/clientPortal";
import { stageLabel } from "@/integrations/supabase/execution";

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

// Same 11 stages the admin side works through (see execution.ts's
// PROJECT_STAGES) — indexing into it gives the client a simple "how far
// along are we" progress bar without exposing any internal stage-management
// controls.
const STAGE_ORDER = [
  "just_started", "planning", "executed", "production", "on_hold", "cancelled",
  "near_completing", "settlement_pending", "retention_pending", "settled_closed", "jms_pending",
];

// Cancelled/on_hold don't represent forward progress along the happy path,
// so the bar treats them as "wherever it last was" rather than 0% or 100%.
const progressPercent = (stage: string) => {
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STAGE_ORDER.length) * 100);
};

const ClientProjectView = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const queryClient = useQueryClient();
  const queryKey = ["client-project", projectId];
  const { data, isLoading } = useQuery({ queryKey, queryFn: () => fetchClientProject(projectId) });

  const [linkUrl, setLinkUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  const addLinkMutation = useMutation({
    mutationFn: () => addClientInspirationLink({ projectId, url: linkUrl, caption: caption || undefined }),
    onSuccess: () => {
      toast.success("Shared with the design team.");
      setLinkUrl("");
      setCaption("");
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to share that."),
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadClientInspirationImage({ projectId, file, caption: caption || undefined });
      toast.success("Shared with the design team.");
      setCaption("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || !data) {
    return <p className="text-sm text-[#777]">Loading your project...</p>;
  }

  const { project, notes, tasks, inspiration } = data;

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-xs uppercase tracking-[0.2em] text-[#888] hover:text-[#111]">
        ← Your Projects
      </button>

      <div className="mb-10 border border-[#eaeaea] bg-white p-6">
        <h1 className="font-serif text-2xl md:text-3xl">{project.project_name}</h1>
        <p className="mt-1 text-sm uppercase tracking-[0.2em] text-[#888]">{stageLabel(project.stage)}</p>

        <div className="mt-4 h-1.5 w-full bg-[#eee]">
          <div className="h-1.5 bg-[#111] transition-all" style={{ width: `${progressPercent(project.stage)}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm md:w-1/2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#888]">Tentative Start</p>
            <p>{formatDate(project.tentative_start_date)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#888]">Tentative Handover</p>
            <p>{formatDate(project.tentative_handover_date)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Updates (client_visible notes) */}
        <div>
          <h2 className="mb-3 font-serif text-xl">Updates</h2>
          <div className="space-y-3">
            {notes.length === 0 && <p className="text-sm text-[#777]">No updates shared yet.</p>}
            {notes.map((note) => (
              <div key={note.id} className="border border-[#eaeaea] bg-white p-4">
                <p className="mb-1 text-xs text-[#888]">{new Date(note.created_at).toLocaleDateString()}</p>
                <p className="text-sm">{note.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline (client_visible tasks) */}
        <div>
          <h2 className="mb-3 font-serif text-xl">Timeline</h2>
          <div className="space-y-2">
            {tasks.length === 0 && <p className="text-sm text-[#777]">No milestones shared yet.</p>}
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between border border-[#eaeaea] bg-white p-3 text-sm">
                <span className={task.done ? "text-[#999] line-through" : ""}>{task.title}</span>
                <span className="text-xs text-[#888]">{formatDate(task.due_date)}{task.done ? " · Done" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspiration board — two-way: the client's own uploads/links show up
          alongside anything the design team has shared back. */}
      <div className="mt-10">
        <h2 className="mb-3 font-serif text-xl">Inspiration</h2>
        <div className="mb-4 border border-[#eaeaea] bg-white p-4">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A short note about what you're sharing (optional)"
            className="mb-2 w-full border border-[#eaeaea] px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Paste a link (Pinterest, Instagram, etc.)"
                className="flex-1 border border-[#eaeaea] px-3 py-2 text-sm"
              />
              <button
                onClick={() => addLinkMutation.mutate()}
                disabled={!linkUrl.trim() || addLinkMutation.isPending}
                className="border border-[#111]/40 px-3 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
              >
                Share
              </button>
            </div>
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleUpload(file);
                }}
                className="w-full border border-[#eaeaea] px-3 py-2 text-sm disabled:opacity-60"
              />
              {uploading && <p className="mt-1 text-xs text-[#888]">Uploading...</p>}
            </div>
          </div>
        </div>

        {inspiration.length === 0 && <p className="text-sm text-[#777]">Nothing shared yet — add an image or link above.</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {inspiration.map((item) => (
            <div key={item.id} className="border border-[#eaeaea] bg-white">
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
              <div className="p-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#888]">
                  {item.source === "admin" ? "From Babel Design" : "You"}
                </p>
                {item.caption && <p className="mt-1 text-xs">{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientProjectView;
