import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const handleApiError = (error: Error) => {
  if (error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0)) {
    localStorage.removeItem("access_token");
    window.location.href = "/auth";
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
});
