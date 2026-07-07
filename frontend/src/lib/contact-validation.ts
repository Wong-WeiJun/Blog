export type ContactFormFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken: string;
};

export function validateContactForm(fields: ContactFormFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!fields.email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }
  if (!fields.subject.trim()) {
    errors.subject = "Please enter a subject.";
  }
  if (fields.message.trim().length < 20) {
    errors.message = "Message must be at least 20 characters.";
  }
  if (!fields.captchaToken) {
    errors.captcha = "Please confirm you're not a robot.";
  }
  return errors;
}
