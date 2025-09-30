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
import { type NavigateFunction } from "react-router";
import { useUser } from "src/stores/userStore";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  grade?: number;
};

// Function to decode JWT payload
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}

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

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, HTTPError>({
    mutationFn: async () => {
      return await kyAspDotnet.delete("api/Accounts/profile").json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useLoginMutation() {
  const setUser = useUser((state) => state.setUser);

  return useMutation<LoginSuccessResponse, HTTPError, LoginData>({
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
                try {
                  const errorBody = await error.response.json();
                  const errorResponse = v.parse(LoginErrorResponseSchema, errorBody);
                  error.message = errorResponse.message;
                  return error;
                } catch {
                  return error;
                }
              },
            ],
          },
        })
        .json();
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      Cookies.set("token", data.data.token, { expires: 1 });
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
