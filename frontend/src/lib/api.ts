import { AxiosError } from "axios";

function extractErrorMessage(err: unknown): string {
  const axiosError = err as AxiosError;
  let detail = (axiosError.response?.data as any)?.detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg || "Something went wrong.";
  }
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  const status = axiosError.response?.status;
  if (status === 400 || status === 401) {
    return "Incorrect email or password";
  }

  const message =
    (err instanceof Error ? err.message : String(err)) ||
    "Something went wrong.";
  return message;
}

export const handleError = function (
  this: (msg: string) => void,
  err: unknown,
) {
  const errorMessage = extractErrorMessage(err);
  this(errorMessage);
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};
