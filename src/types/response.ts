import * as v from "valibot";

export const FailApiResponseSchema = v.object({
  message: v.string(),
});
