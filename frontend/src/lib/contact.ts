import { contactSubmitContactForm } from "@/client/sdk.gen";
import type { ContactRequest } from "@/client/types.gen";

export type ContactSuccessResponse = {
  status: string;
  message: string;
};

export type { ContactRequest };

export async function submitContactForm(
  body: ContactRequest,
): Promise<ContactSuccessResponse> {
  const res = await contactSubmitContactForm({
    body,
    throwOnError: true,
  });
  return res.data as ContactSuccessResponse;
}
