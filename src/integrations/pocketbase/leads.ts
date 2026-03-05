import type { RecordModel } from "pocketbase";
import { getPocketBaseClient } from "./client";

export type LeadSource = "consultancy_form" | "newsletter" | "manual";
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost";

export interface CreateLeadInput {
  name?: string;
  email: string;
  phone?: string;
  source: LeadSource;
  status?: LeadStatus;
  projectType?: string;
  timeline?: string;
  message?: string;
  notes?: string;
}

type LeadRecord = RecordModel & {
  name?: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  status?: LeadStatus;
  project_type?: string;
  timeline?: string;
  message?: string;
  notes?: string;
  created?: string;
  updated?: string;
};

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  projectType: string;
  timeline: string;
  message: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const toLead = (record: LeadRecord): Lead => ({
  id: record.id,
  name: readString(record.name),
  email: readString(record.email),
  phone: readString(record.phone),
  source: (record.source ?? "manual") as LeadSource,
  status: (record.status ?? "new") as LeadStatus,
  projectType: readString(record.project_type),
  timeline: readString(record.timeline),
  message: readString(record.message),
  notes: readString(record.notes),
  createdAt: readString(record.created),
  updatedAt: readString(record.updated),
});

const isDuplicateEmailError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeResponse = (error as { response?: unknown }).response;
  if (!maybeResponse || typeof maybeResponse !== "object") return false;
  const data = (maybeResponse as { data?: unknown }).data;
  if (!data || typeof data !== "object") return false;
  const email = (data as { email?: unknown }).email;
  if (!email || typeof email !== "object") return false;
  return (email as { code?: string }).code === "validation_not_unique";
};

export const createLead = async (input: CreateLeadInput): Promise<void> => {
  try {
    await getPocketBaseClient().collection("leads").create({
      name: input.name ?? "",
      email: input.email,
      phone: input.phone ?? "",
      source: input.source,
      status: input.status ?? "new",
      project_type: input.projectType ?? "",
      timeline: input.timeline ?? "",
      message: input.message ?? "",
      notes: input.notes ?? "",
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) return;
    throw error;
  }
};

export const fetchLeads = async (): Promise<Lead[]> => {
  const records = await getPocketBaseClient().collection("leads").getFullList<LeadRecord>({
    sort: "-created",
  });
  return records.map(toLead);
};

export const updateLead = async (id: string, input: { status?: LeadStatus; notes?: string }): Promise<void> => {
  await getPocketBaseClient().collection("leads").update(id, {
    ...(input.status ? { status: input.status } : {}),
    ...(typeof input.notes === "string" ? { notes: input.notes } : {}),
  });
};
