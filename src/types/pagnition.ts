import * as v from "valibot";

export const PagnitionSchema = v.object({
  pageNumber: v.pipe(v.number(), v.integer(), v.minValue(0)),
  pageSize: v.pipe(v.number(), v.integer(), v.minValue(0)),
  totalPages: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export type Pagnition = v.InferOutput<typeof PagnitionSchema>;
