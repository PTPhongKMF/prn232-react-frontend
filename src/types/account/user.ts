import * as v from "valibot";

export const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  password: v.string(),
  role: v.string(),
  grade: v.optional(v.number()),
  isDeleted: v.boolean(),
});

export type User = v.InferOutput<typeof UserSchema>;
