import { useMutation } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { LoginSchema, RegisterSchema, type LoginData, type RegisterData } from "src/types/auth";
import { genericApiResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";

export function useLoginMutation() {
  return useMutation<unknown, HTTPError, LoginData>({
    mutationFn: async (loginData) => {
      const validatedLoginData = v.parse(LoginSchema, loginData);
      return await kyAspDotnet
        .post("api/Accounts/login", {
          json: {
            email: validatedLoginData.email,
            password: validatedLoginData.password,
          },
          hooks: {
            beforeError: [
              async (error) => {
                const errorBody = await error.response.json();
                const errorResponse = v.parse(genericApiResponseSchema(v.unknown()), errorBody);
                error.message = errorResponse.message ?? "An unknown error occurred.";
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

export function useRegisterMutation() {
  return useMutation<unknown, HTTPError, RegisterData>({
    mutationFn: async (registerData) => {
      const validatedRegisterData = v.parse(RegisterSchema, registerData);

      return await kyAspDotnet
        .post("api/Accounts/register", {
          json: validatedRegisterData,
          hooks: {
            beforeError: [
              async (error) => {
                const errorBody = await error.response.json();
                const errorResponse = v.parse(genericApiResponseSchema(v.unknown()), errorBody);
                error.message = errorResponse.message ?? "An unknown error occurred.";
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
