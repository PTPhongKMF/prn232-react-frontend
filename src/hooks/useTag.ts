import { useMutation, useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import {
  type PagnitedTagSuccessResponse,
  PagnitedTagSuccessResponseSchema,
  type TagRequest,
  TagRequestSchema,
  type TagSuccessResponse,
  TagSuccessResponseSchema,
} from "src/types/tag/tag";
import * as v from "valibot";

interface TagUpdateRequest {
  id: number;
  name: string;
}

export function useTagList() {
  return useQuery<TagSuccessResponse, HTTPError>({
    queryKey: ["tag"],
    queryFn: async () => {
      const res = await kyAspDotnet.get("api/Tags").json();
      return v.parse(TagSuccessResponseSchema, res);
    },
  });
}

export function usePagnitedTagList(tagRequest: TagRequest) {
  return useQuery<PagnitedTagSuccessResponse, HTTPError>({
    queryKey: ["tag", tagRequest],
    queryFn: async () => {
      const query = v.parse(TagRequestSchema, tagRequest);

      const res = await kyAspDotnet
        .get("api/Tags/filtered", {
          searchParams: query,
        })
        .json();

      return v.parse(PagnitedTagSuccessResponseSchema, res);
    },
  });
}

export function useCreateTagMutation() {
  return useMutation<void, HTTPError, string>({
    mutationFn: async (name) => {
      return await kyAspDotnet
        .post("api/Tags", {
          json: {
            name,
          },
        })
        .json();
    },
  });
}

export function useUpdateTagMutation() {
  return useMutation<void, HTTPError, TagUpdateRequest>({
    mutationFn: async (updateRequest) => {
      return await kyAspDotnet
        .put(`api/Tags/${updateRequest.id}`, {
          json: {
            name: updateRequest.name,
          },
        })
        .json();
    },
  });
}

export function useDeleteTagMutation() {
  return useMutation<void, HTTPError, number>({
    mutationFn: async (id) => {
      return await kyAspDotnet.delete(`api/Tags/${id}`).json();
    },
  });
}
