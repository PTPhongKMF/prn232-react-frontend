import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import { SlideCreateSchema, type Slide, type SlideCreateData } from "src/types/slide/slide";
import * as v from "valibot";

export function useCreateSlideMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, HTTPError, { slideDto: SlideCreateData; file: File }>({
    mutationFn: async ({ slideDto, file }) => {
      const validatedSlideData = v.parse(SlideCreateSchema, slideDto);

      const formData = new FormData();
      formData.append("slideDtoStr", JSON.stringify(validatedSlideData));
      formData.append("file", file);

      return await kyAspDotnet
        .post("api/Slides", {
          body: formData,
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slides"] });
    },
    onError: (error) => {
      console.error("Slide creation failed:", error);
    },
  });
}

export function useSlidesByTeacherId(teacherId?: number) {
  return useQuery<Slide[], HTTPError>({
    queryKey: ["slides", teacherId],
    queryFn: async () => {
      const response = await kyAspDotnet.get(`api/Slides/user/${teacherId}`).json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.array(v.any())), response);
      return parsed.data as Slide[];
    },
    enabled: !!teacherId,
  });
}