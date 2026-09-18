import { getSupabaseClient } from "./client";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const sendContactConfirmationEmail = async (input: ContactMessageInput) => {
  const { error } = await getSupabaseClient().functions.invoke("send-contact-confirmation", {
    body: {
      name: input.name,
      email: input.email,
      subject: input.subject ?? "",
      message: input.message,
    },
  });

  if (error) {
    throw new Error("Message saved, but confirmation email could not be sent.");
  }
};

export const createContactMessage = async (input: ContactMessageInput) => {
  const { error } = await getSupabaseClient().from("contact_messages").insert({
    name: input.name,
    email: input.email,
    subject: input.subject || null,
    message: input.message,
  });

  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") {
      throw new Error("Supabase table missing: public.contact_messages. Run supabase/schema.sql in SQL Editor.");
    }
    throw error;
  }

  await sendContactConfirmationEmail(input);
};
