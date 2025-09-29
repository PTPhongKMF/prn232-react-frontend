import { useMutation } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { FailApiResponseSchema } from "src/types/response";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.minLength(1, "Email is required"),
    v.email("Invalid email format"),
  ),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

type LoginData = v.InferOutput<typeof LoginSchema>;

export function useLoginMutation() {
  return useMutation<unknown, HTTPError, LoginData>({
    mutationFn: async (loginData: LoginData) => {
      v.parse(LoginSchema, loginData);
      return await kyAspDotnet
        .post("api/Accounts/login", {
          json: {
            email: loginData.email,
            password: loginData.password,
          },
          hooks: {
            beforeError: [
              async (error) => {
                const errorBody = await error.response.json();
                const errorResponse = v.parse(
                  FailApiResponseSchema,
                  errorBody,
                  { message: "An unknown error occurred." },
                );
                error.message = errorResponse.message;
                return error;
              },
            ],
          },
        })
        .json();
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });
}

// 1. Define the shape and validation rules for registration data
const RegisterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters.")),
  email: v.pipe(
    v.string(),
    v.minLength(1, "Email is required."),
    v.email("Invalid email format."),
  ),
  password: v.pipe(v.string(), v.minLength(6, "Password must be at least 6 characters.")),
  grade: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(12))),
});

type RegisterData = v.InferOutput<typeof RegisterSchema>;

// 2. Create the mutation hook for registration
export function useRegisterMutation() {
  return useMutation<unknown, HTTPError, RegisterData>({
    mutationFn: async (registerData: RegisterData) => {
      // Validate the data before sending it to the API
      v.parse(RegisterSchema, registerData);

      // Call the backend's "register" endpoint
      return await kyAspDotnet
        .post("api/Accounts/register", {
          json: registerData,
          hooks: {
            beforeError: [
              async (error) => {
                const errorBody = await error.response.json();
                const errorResponse = v.parse(
                  FailApiResponseSchema,
                  errorBody,
                  { message: "An unknown registration error occurred." },
                );
                error.message = errorResponse.message;
                return error;
              },
            ],
          },
        })
        .json();
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}