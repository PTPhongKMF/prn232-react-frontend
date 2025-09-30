import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import {
  LoginErrorResponseSchema,
  LoginSchema,
  RegisterSchema,
  UpdateUserSchema,
  type LoginData,
  type LoginErrorResponse,
  type LoginSuccessResponse,
  type RegisterData,
  type UpdateUserData,
} from "src/types/account/auth";
import { createApiErrorResponseSchema, createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import { Cookies } from "typescript-cookie";
import { useUser } from "src/stores/userStore";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  grade?: number;
};

export function useProfile() {
  const token = Cookies.get("token");

  return useQuery<User, HTTPError>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/Accounts/profile").json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as User;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, HTTPError, UpdateUserData>({
    mutationFn: async (userData) => {
      const validatedUserData = v.parse(UpdateUserSchema, userData);
      const response = await kyAspDotnet
        .put("api/Accounts/profile", {
          json: validatedUserData,
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useLoginMutation() {
  const setUser = useUser((state) => state.setUser);

  return useMutation<LoginSuccessResponse, LoginErrorResponse, LoginData>({
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
                const errorResponse = v.parse(LoginErrorResponseSchema, errorBody);
                error.message = errorResponse.message ?? "An unknown error occurred.";
                return error;
              },
            ],
          },
        })
        .json();
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      Cookies.set("token", data.data.token);
    },
    onError: (error) => {
      console.error("Login failed:", error);
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
                const errorResponse = v.parse(createApiSuccessResponseSchema(v.unknown()), errorBody);
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
