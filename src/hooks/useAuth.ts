import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { LoginSchema, RegisterSchema, UpdateUserSchema, type LoginData, type RegisterData, type UpdateUserData } from "src/types/auth";
import { genericApiResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import { Cookies } from "typescript-cookie";
import { type NavigateFunction } from "react-router";

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

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, HTTPError>({
    mutationFn: async () => {
      return await kyAspDotnet.delete("api/Accounts/profile").json();
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

export function useLoginMutation(navigate: NavigateFunction) {
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

        const decodedToken = decodeJwt(token);
        const userRole = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        if (userRole === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
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