import { getAccessToken } from "./auth";
import { getSupabaseClient } from "./client";
import { readFileAsBase64 } from "./admin";
import type { ProjectStage } from "./execution";

// Thrown when a client-portal call fails for an auth reason. Simpler than
// admin.ts's AdminAuthError: there's no "forbidden — not on an allowlist"
// case for clients, since access is per-project (client_project_access),
// not an all-or-nothing role. A 403 here always means "not your project",
// which callers show inline rather than treating as a sign-in problem.
export class ClientPortalError extends Error {
  readonly kind: "unauthenticated" | "no_access";
  constructor(kind: "unauthenticated" | "no_access", message: string) {
    super(message);
    this.name = "ClientPortalError";
    this.kind = kind;
  }
}

const invokeClientPortal = async <T>(body: Record<string, unknown>): Promise<T> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ClientPortalError("unauthenticated", "You're not signed in.");
  }

  const { data, error } = await getSupabaseClient().functions.invoke("client-portal", {
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });

  if (error) {
    const status = (error as { context?: { status?: number } })?.context?.status;
    if (status === 401) throw new ClientPortalError("unauthenticated", "Your session has expired. Please sign in again.");
    if (status === 403) throw new ClientPortalError("no_access", "You don't have access to this project.");
    throw error;
  }

  return data as T;
};

export interface ClientProjectSummary {
  id: string;
  project_name: string;
  stage: ProjectStage;
  tentative_start_date: string | null;
  tentative_handover_date: string | null;
}

export interface ClientProjectNote {
  id: string;
  body: string;
  created_at: string;
}

export interface ClientProjectTask {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
}

export interface ClientInspirationItem {
  id: string;
  source: "client" | "admin";
  kind: "image" | "link";
  url: string;
  caption: string | null;
  created_at: string;
}

export interface ClientProjectDetailResponse {
  project: ClientProjectSummary;
  notes: ClientProjectNote[];
  tasks: ClientProjectTask[];
  inspiration: ClientInspirationItem[];
}

// Called once right after the client signs in — links any project(s) whose
// client_email matches this account's email, and returns what they can see.
export const bootstrapClientPortal = () =>
  invokeClientPortal<{ success: boolean; projects: ClientProjectSummary[] }>({ action: "bootstrap" });

export const fetchClientProject = (projectId: string) =>
  invokeClientPortal<ClientProjectDetailResponse>({ action: "get_project", projectId });

export const addClientInspirationLink = (input: { projectId: string; url: string; caption?: string }) =>
  invokeClientPortal<{ success: boolean; item: ClientInspirationItem }>({ action: "add_inspiration_link", ...input });

export const uploadClientInspirationImage = async (input: { projectId: string; file: File; caption?: string }) => {
  const fileBase64 = await readFileAsBase64(input.file);
  return invokeClientPortal<{ success: boolean; item: ClientInspirationItem }>({
    action: "upload_inspiration_image",
    projectId: input.projectId,
    caption: input.caption,
    fileName: input.file.name,
    fileBase64,
    contentType: input.file.type || "image/png",
  });
};
