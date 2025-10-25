import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import { SlideCreateSchema, SlideUpdateSchema, type Slide, type SlideCreateData, type SlideUpdateData, type SlideWithTeacher } from "src/types/slide/slide";
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

export function useUpdateSlideMutation() {
    const queryClient = useQueryClient();
    return useMutation<Slide, HTTPError, { slideDto: SlideUpdateData; file: File | null }>({
      mutationFn: async ({ slideDto, file }) => {
        const validatedSlideData = v.parse(SlideUpdateSchema, slideDto);
        const { id, ...payload } = validatedSlideData;
  
        const formData = new FormData();
        formData.append("slideDtoStr", JSON.stringify(payload));
        if (file) {
          formData.append("file", file);
        }
  
        const response = await kyAspDotnet
          .put(`api/Slides/${id}`, {
            body: formData,
          })
          .json();
        const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
        return parsed.data as Slide;
      },
      onSuccess: (updatedSlide) => {
        queryClient.invalidateQueries({ queryKey: ["slides", updatedSlide.teacherId] });
      },
    });
  }

export function useUpdateSlideStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation<Slide, HTTPError, { slideId: number; isPublished: boolean }>({
    mutationFn: async ({ slideId, isPublished }) => {
      const response = await kyAspDotnet
        .patch(`api/Slides/${slideId}/status`, {
          json: { isPublished },
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as Slide;
    },
    onSuccess: (updatedSlide) => {
      queryClient.invalidateQueries({ queryKey: ["slides", updatedSlide.teacherId] });
    },
  });
}
export function usePublicSlides() {
    return useQuery<SlideWithTeacher[], HTTPError>({
      queryKey: ["publicSlides"],
      queryFn: async () => {
        try {
          const response = await kyAspDotnet.get(`api/Slides/public`).json();
          const parsed = v.parse(createApiSuccessResponseSchema(v.array(v.any())), response);
          return parsed.data as SlideWithTeacher[];
        } catch (error) {
          console.error("usePublicSlides - API call failed:", error);
          throw error;
        }
      },
      retry: false,
    });
  }