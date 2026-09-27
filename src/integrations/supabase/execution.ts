import { invokeAdmin, readFileAsBase64 } from "./admin";

// The Execution suite: projects, project notes (which also cover the
// client-visibility-toggled "remarks" from the requirements doc — see the
// note on that in project_notes' schema comment), timeline tasks, and
// documents. Mirrors admin.ts's shape: typed responses, invokeAdmin for the
// auth-aware call, one function per edge function action.

export const PROJECT_STAGES = [
  { value: "just_started", label: "Just Started" },
  { value: "planning", label: "Planning" },
  { value: "executed", label: "Executed" },
  { value: "production", label: "Production" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
  { value: "near_completing", label: "Near Completing" },
  { value: "settlement_pending", label: "Settlement Pending" },
  { value: "retention_pending", label: "Retention Pending" },
  { value: "settled_closed", label: "Settled & Closed" },
  { value: "jms_pending", label: "JMS Pending" },
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number]["value"];

export interface ProjectRecord {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  project_name: string;
  stage: ProjectStage;
  owner_user_id: string | null;
  assigned_mailbox: string | null;
  tentative_start_date: string | null;
  tentative_handover_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  body: string;
  mentioned_user_ids: string[];
  mentioned_names: string[];
  client_visible: boolean;
  created_at: string;
  author_user_id: string | null;
  author_name: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
  assignee_user_id: string | null;
  assignee_name: string | null;
  client_visible: boolean;
  created_at: string;
  bucket: "done" | "delayed" | "current" | "upcoming";
}

export interface ProjectDocument {
  id: string;
  folder: string;
  file_name: string;
  kind: "file" | "link";
  created_at: string;
}

export interface ProjectDetailResponse {
  project: ProjectRecord;
  notes: ProjectNote[];
  tasks: ProjectTask[];
  timelineSummary: { current: number; upcoming: number; delayed: number; done: number };
  documents: ProjectDocument[];
  teamMembers: { id: string; name: string; email: string | null }[];
}

export const fetchProjectDetail = (projectId: string) =>
  invokeAdmin<ProjectDetailResponse>("admin-project-detail", { projectId });

export const createProject = (input: {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  projectName: string;
  consultancyRequestId?: string;
  ownerUserId?: string;
  assignedMailbox?: string;
  tentativeStartDate?: string;
  tentativeHandoverDate?: string;
}) => invokeAdmin<{ success: boolean; project: ProjectRecord }>("admin-execution", { action: "create_project", ...input });

export const updateProject = (
  projectId: string,
  input: Partial<{
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    projectName: string;
    stage: ProjectStage;
    ownerUserId: string;
    assignedMailbox: string;
    tentativeStartDate: string;
    tentativeHandoverDate: string;
  }>,
) => invokeAdmin<{ success: boolean; project: ProjectRecord }>("admin-execution", { action: "update_project", projectId, ...input });

export const addProjectNote = (input: { projectId: string; body: string; mentionedUserIds: string[]; clientVisible: boolean }) =>
  invokeAdmin<{ success: boolean; note: ProjectNote }>("admin-execution", { action: "add_note", ...input });

export const addProjectTask = (input: { projectId: string; title: string; dueDate: string; assigneeUserId?: string; clientVisible: boolean }) =>
  invokeAdmin<{ success: boolean; task: ProjectTask }>("admin-execution", { action: "add_task", ...input });

export const updateProjectTask = (taskId: string, input: Partial<{ done: boolean; title: string; dueDate: string; clientVisible: boolean }>) =>
  invokeAdmin<{ success: boolean; task: ProjectTask }>("admin-execution", { action: "update_task", taskId, ...input });

export const listProjectDocuments = (projectId: string) =>
  invokeAdmin<{ success: boolean; documents: ProjectDocument[] }>("admin-project-documents", { action: "list", projectId });

export const addProjectDocumentLink = (input: { projectId: string; url: string; fileName?: string; folder?: string }) =>
  invokeAdmin<{ success: boolean; document: ProjectDocument }>("admin-project-documents", { action: "add_link", ...input });

export const uploadProjectDocument = async (input: { projectId: string; file: File; folder?: string }) => {
  const fileBase64 = await readFileAsBase64(input.file);
  return invokeAdmin<{ success: boolean; document: ProjectDocument }>("admin-project-documents", {
    action: "upload",
    projectId: input.projectId,
    folder: input.folder,
    fileName: input.file.name,
    fileBase64,
    contentType: input.file.type || "application/octet-stream",
  });
};

export const getProjectDocumentUrl = (documentId: string) =>
  invokeAdmin<{ success: boolean; url: string }>("admin-project-documents", { action: "get_url", documentId });

export const stageLabel = (stage: string) => PROJECT_STAGES.find((s) => s.value === stage)?.label ?? stage;

export const updateLeadStatus = (consultancyRequestId: string, status: "open" | "converted" | "lost") =>
  invokeAdmin<{ success: boolean; lead: unknown }>("admin-execution", { action: "update_lead_status", consultancyRequestId, status });
