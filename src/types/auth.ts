import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.minLength(1, "Email is required"), v.email("Invalid email format")),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

export const RegisterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters.")),
  email: v.pipe(v.string(), v.minLength(1, "Email is required."), v.email("Invalid email format.")),
  password: v.pipe(v.string(), v.minLength(6, "Password must be at least 6 characters.")),
  grade: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(12))),
});

export const UpdateUserSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters."))),
  email: v.optional(v.pipe(v.string(), v.minLength(1, "Email is required."), v.email("Invalid email format."))),
  password: v.optional(v.pipe(v.string(), v.minLength(6, "Password must be at least 6 characters."))),
});

export const AdminUpdateUserSchema = v.object({
  role: v.picklist(["Admin", "Teacher", "Student"]),
  grade: v.nullable(v.pipe(v.number(), v.minValue(1), v.maxValue(12))),
});

export type LoginData = v.InferOutput<typeof LoginSchema>;
export type RegisterData = v.InferOutput<typeof RegisterSchema>;
export type UpdateUserData = v.InferOutput<typeof UpdateUserSchema>;
export type AdminUpdateUserData = v.InferOutput<typeof AdminUpdateUserSchema>;