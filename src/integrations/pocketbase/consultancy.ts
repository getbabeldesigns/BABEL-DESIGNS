import { getPocketBaseClient } from "./client";

export interface ConsultancyRequestInput {
  name: string;
  email: string;
  phone?: string;
  projectType?: string;
  timeline?: string;
  message?: string;
}

export const createConsultancyRequest = async (input: ConsultancyRequestInput) => {
  await getPocketBaseClient().collection("consultancy_requests").create({
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    project_type: input.projectType || "",
    timeline: input.timeline || "",
    message: input.message || "",
  });
};
