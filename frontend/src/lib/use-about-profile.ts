import { useQuery } from "@tanstack/react-query";
import { aboutGetAbout } from "@/client/sdk.gen";
import type { SiteAboutResponse } from "@/client/types.gen";
import { DEFAULT_ABOUT_PROFILE } from "./about-defaults";

export function useAboutProfile() {
  return useQuery({
    queryKey: ["about"],
    queryFn: async (): Promise<SiteAboutResponse> => {
      const res = await aboutGetAbout();
      if (res.error || !res.data) {
        throw new Error("Failed to load about profile");
      }
      return res.data as SiteAboutResponse;
    },
    placeholderData: DEFAULT_ABOUT_PROFILE,
    staleTime: 60_000,
  });
}
