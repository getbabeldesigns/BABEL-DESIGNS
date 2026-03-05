import { getPocketBaseClient } from "./client";
import { createLead } from "./leads";

export interface StudioDispatchSubscriptionInput {
  email: string;
}

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

export const createStudioDispatchSubscription = async (input: StudioDispatchSubscriptionInput) => {
  try {
    await getPocketBaseClient().collection("studio_dispatch_subscribers").create({
      email: input.email,
    });
    await createLead({
      email: input.email,
      source: "newsletter",
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) return;
    throw error;
  }
};
