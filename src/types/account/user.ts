import * as v from "valibot";

export const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  password: v.string(),
  role: v.string(),
  grade: v.optional(v.number()),
});

export const LoginResponseSchema = v.object({
  user: UserSchema,
  token: v.pipe(v.string(), v.nonEmpty()),
});

export type User = v.InferOutput<typeof UserSchema>;
export type LoginResponse = v.InferOutput<typeof LoginResponseSchema>;
