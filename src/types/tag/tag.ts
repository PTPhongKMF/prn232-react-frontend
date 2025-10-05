import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";

export const TagSchema = v.object({
  id: v.pipe(v.number(), v.integer()),
  name: v.string(),
});

export const TagSuccessResponseSchema = createApiSuccessResponseSchema(v.array(TagSchema));

export type Tag = v.InferOutput<typeof TagSchema>;
export type TagSuccessResponse = v.InferOutput<typeof TagSuccessResponseSchema>;
