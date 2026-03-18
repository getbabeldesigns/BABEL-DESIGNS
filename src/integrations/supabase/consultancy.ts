import { getSupabaseClient } from "./client";

export interface ConsultancyRequestInput {
  name: string;
  email: string;
  phone?: string;
  projectType?: string;
  timeline?: string;
  message?: string;
}

const sendConsultancyConfirmationEmail = async (input: { name: string; email: string }) => {
  const { error } = await getSupabaseClient().functions.invoke("send-consultancy-confirmation", {
    body: {
      name: input.name,
      email: input.email,
    },
  });

  if (error) {
    throw new Error("Request saved, but confirmation email could not be sent.");
  }
};

export const createConsultancyRequest = async (input: ConsultancyRequestInput) => {
  const { error } = await getSupabaseClient().from("consultancy_requests").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    project_type: input.projectType || null,
    timeline: input.timeline || null,
    message: input.message || null,
  });

  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") {
      throw new Error("Supabase table missing: public.consultancy_requests. Run supabase/schema.sql in SQL Editor.");
    }
    throw error;
  }

  await sendConsultancyConfirmationEmail({
    name: input.name,
    email: input.email,
  });
};
