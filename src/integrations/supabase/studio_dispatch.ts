import { getSupabaseClient } from "./client";

export interface SendStudioDispatchConfirmationEmailInput {
  email: string;
}

const sendFallbackConfirmationEmail = async (input: SendStudioDispatchConfirmationEmailInput) => {
  const { error } = await getSupabaseClient().functions.invoke("send-consultancy-confirmation", {
    body: {
      name: "Studio Dispatch Subscriber",
      email: input.email,
      phone: "",
      projectType: "Studio Dispatch",
      timeline: "",
      preferredDate: "",
      preferredSlot: "",
      message: "Studio Dispatch subscription",
    },
  });

  if (error) {
    throw new Error("Subscription saved, but confirmation email could not be sent.");
  }
};

const sendStudioDispatchConfirmationEmail = async (input: SendStudioDispatchConfirmationEmailInput) => {
  const { error } = await getSupabaseClient().functions.invoke("send-studio-dispatch-confirmation", {
    body: {
      email: input.email,
    },
  });

  if (!error) {
    return;
  }

  await sendFallbackConfirmationEmail(input);
};

export interface StudioDispatchSubscriptionInput {
  email: string;
}

export const createStudioDispatchSubscription = async (input: StudioDispatchSubscriptionInput) => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("studio_dispatch_subscribers")
    .insert({
      email: input.email,
    });

  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") {
      const { error: fallbackError } = await supabase.from("consultancy_requests").insert({
        name: "Studio Dispatch Subscriber",
        email: input.email,
        project_type: "studio_dispatch",
      });

      if (!fallbackError) {
        await sendStudioDispatchConfirmationEmail({ email: input.email });
        return;
      }

      throw new Error("Subscription storage is not ready yet. Please run supabase/schema.sql in SQL Editor.");
    }
    if (error.code === "23505") {
      // Unique violation: already subscribed.
      return;
    }
    throw error;
  }

  await sendStudioDispatchConfirmationEmail({ email: input.email });
};
