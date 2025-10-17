import { useMutation, useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import * as v from "valibot";
import { kyAspDotnet } from "src/services/ApiService";
import {
  PagnitedQuestionWithDetailSuccessResponseSchema,
  QuestionRequestSchema,
  type QuestionWithDetail,
  type PagnitedQuestionWithDetailSuccessResponse,
  type QuestionRequest,
  type UpdateQuestion,
  UpdateQuestionSchema,
} from "src/types/question/question";

export function usePagnitedQuestionWithDetail(questionRequest: QuestionRequest, enabled: boolean) {
  return useQuery<PagnitedQuestionWithDetailSuccessResponse, HTTPError>({
    queryKey: ["questionbanklist", questionRequest],
    queryFn: async () => {
      const query = v.parse(QuestionRequestSchema, questionRequest);

      const res = await kyAspDotnet
        .get("api/Questions/filtered", {
          searchParams: {
            ...query,
            tagIds: query.tagIds.length > 0 ? query.tagIds.join(",") : "",
            from: query.from ? new Date(query.from).toISOString() : undefined,
            to: query.to ? new Date(query.to).toISOString() : undefined,
          },
        })
        .json();

      return v.parse(PagnitedQuestionWithDetailSuccessResponseSchema, res);
    },
    enabled: enabled,
  });
}

export function useCreateQuestionMutation() {
  return useMutation<unknown, HTTPError, UpdateQuestion>({
    mutationFn: async (data) => {
      return await kyAspDotnet.post("api/Questions", {
        json: v.parse(UpdateQuestionSchema, data),
      });
    },
  });
}

export function useUpdateQuestionMutation() {
  return useMutation<unknown, HTTPError, { id: number; data: UpdateQuestion }>({
    mutationFn: async ({ id, data }) => {
      return await kyAspDotnet.put(`api/Questions/${id}`, {
        json: v.parse(UpdateQuestionSchema, data),
      });
    },
  });
}

export function useDeleteQuestionMutation() {
  return useMutation<unknown, HTTPError, QuestionWithDetail>({
    mutationFn: async (updateQuestionRequest) => {
      return await kyAspDotnet.delete(`api/Questions/${updateQuestionRequest.id}`);
    },
  });
}
