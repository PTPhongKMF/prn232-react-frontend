import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { type TagSuccessResponse, TagSuccessResponseSchema } from "src/types/tag/tag";
import * as v from "valibot";

export function useTagList() {
  return useQuery<TagSuccessResponse, HTTPError>({
    queryKey: ["tag"],
    queryFn: async () => {
      const res = await kyAspDotnet.get("api/Tags").json();
      return v.parse(TagSuccessResponseSchema, res);
    },
  });
}
