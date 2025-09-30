import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiErrorResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import type { User } from "./useAuth";

export function useUsers() {
  return useQuery<User[], HTTPError>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/Admin/users").json();
      const parsed = v.parse(createApiErrorResponseSchema(v.array(v.any())), response);
      return parsed.data as User[];
    },
    retry: false,
  });
}

export function useUpdateUserPermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, HTTPError, { userId: number; role?: string; grade?: number | null }>({
    mutationFn: async ({ userId, ...userData }) => {
      const response = await kyAspDotnet
        .put(`api/Admin/users/${userId}/permissions`, {
          json: userData,
        })
        .json();
      const parsed = v.parse(createApiErrorResponseSchema(v.any()), response);
      return parsed.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, HTTPError, { userId: number }>({
    mutationFn: async ({ userId }) => {
      return await kyAspDotnet.delete(`api/Admin/users/${userId}`).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
