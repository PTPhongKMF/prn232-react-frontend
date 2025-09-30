import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import {
  LoginSchema,
  RegisterSchema,
  UpdateUserSchema,
  type LoginData,
  type RegisterData,
  type UpdateUserData,
  AdminUpdateUserSchema,
  type AdminUpdateUserData,
} from "src/types/auth";
import { genericApiResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import { Cookies } from "typescript-cookie";

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
      const parsed = v.parse(genericApiResponseSchema(v.any()), response);
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
      const parsed = v.parse(genericApiResponseSchema(v.any()), response);
      return parsed.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<any, HTTPError, LoginData>({
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
      const token = data?.data?.token;
      if (token && typeof token === "string") {
        Cookies.set("token", token, { expires: 1 });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
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

export function useAdminUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, HTTPError, { userId: number; userData: AdminUpdateUserData }>({
    mutationFn: async ({ userId, userData }) => {
      const validatedUserData = v.parse(AdminUpdateUserSchema, userData);
      const response = await kyAspDotnet
        .put(`api/Admin/users/${userId}/permissions`, {
          json: validatedUserData,
        })
        .json();
      const parsed = v.parse(genericApiResponseSchema(v.any()), response);
      return parsed.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
}
