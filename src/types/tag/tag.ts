import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import { PagnitionSchema } from "src/types/pagnition";
import * as v from "valibot";

export const TagSchema = v.object({
  id: v.pipe(v.number(), v.integer()),
  name: v.string(),
});

export const TagSuccessResponseSchema = createApiSuccessResponseSchema(v.array(TagSchema));

export const TagRequestSchema = v.object({
  ...PagnitionSchema.entries,
  searchTerm: v.string(),
});

const PagnitedTagSchema = v.object({
  results: v.array(TagSchema),
  pagnition: PagnitionSchema,
});

export const PagnitedTagSuccessResponseSchema = createApiSuccessResponseSchema(PagnitedTagSchema);

export type Tag = v.InferOutput<typeof TagSchema>;
export type TagSuccessResponse = v.InferOutput<typeof TagSuccessResponseSchema>;
export type TagRequest = v.InferOutput<typeof TagRequestSchema>;
export type PagnitedTagSuccessResponse = v.InferOutput<typeof PagnitedTagSuccessResponseSchema>;
