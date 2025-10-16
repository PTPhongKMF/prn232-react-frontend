import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import Cookies from "js-cookie";

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface PurchasedItem {
  slideId: number;
  title: string;
  fileUrl: string | null;
}

export interface ReceiptResponse {
  id: number;
  userId: number;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  purchasedItems: PurchasedItem[];
}

// ✅ Lấy token an toàn
function getToken() {
  return Cookies.get("token") || localStorage.getItem("token");
}

// ✅ Danh sách phương thức thanh toán
export function usePaymentMethods() {
  const token = getToken();
  return useQuery<PaymentMethod[], HTTPError>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await kyAspDotnet
        .get("api/PaymentMethods", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
      const parsed = v.parse(
        createApiSuccessResponseSchema(v.array(v.any())),
        response
      );
      return parsed.data as PaymentMethod[];
    },
  });
}

// ✅ Thêm phương thức thanh toán
export function useCreatePaymentMethodMutation() {
  const queryClient = useQueryClient();
  const token = getToken();
  return useMutation<PaymentMethod, HTTPError, { name: string }>({
    mutationFn: async (newMethod) => {
      const response = await kyAspDotnet
        .post("api/PaymentMethods", {
          json: newMethod,
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as PaymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}

// ✅ Cập nhật phương thức thanh toán
export function useUpdatePaymentMethodMutation() {
  const queryClient = useQueryClient();
  const token = getToken();
  return useMutation<PaymentMethod, HTTPError, PaymentMethod>({
    mutationFn: async (method) => {
      const response = await kyAspDotnet
        .put(`api/PaymentMethods/${method.id}`, {
          json: { name: method.name },
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as PaymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}

// ✅ Xoá phương thức thanh toán
export function useDeletePaymentMethodMutation() {
  const queryClient = useQueryClient();
  const token = getToken();
  return useMutation<unknown, HTTPError, number>({
    mutationFn: async (methodId) => {
      return await kyAspDotnet
        .delete(`api/PaymentMethods/${methodId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
}

// ✅ Mua slide (Purchase)
export function usePurchaseMutation() {
  const token = getToken();
  return useMutation<{ data: ReceiptResponse }, HTTPError, { slideIds: number[]; paymentMethodId: number }>({
    mutationFn: async (purchaseData) => {
      const response = await kyAspDotnet
        .post("api/Purchase", {
          json: purchaseData,
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
      return v.parse(createApiSuccessResponseSchema(v.any()), response);
    },
    onError: (error) => {
      console.error("❌ Purchase failed:", error);
    },
  });
}

// ✅ Cập nhật trạng thái giao dịch
export function useUpdateReceiptStatusMutation() {
  const queryClient = useQueryClient();
  const token = getToken();
  return useMutation<unknown, HTTPError, { receiptId: number; status: "Paid" | "Failed" }>({
    mutationFn: async ({ receiptId, status }) => {
      return await kyAspDotnet
        .patch(`api/Purchase/${receiptId}/status`, {
          json: { status },
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseHistory"] });
    },
    onError: (error) => {
      console.error("❌ Status update failed:", error);
    },
  });
}

// ✅ Lịch sử mua hàng (Purchase history)
export function usePurchaseHistory() {
  const token = getToken();
  return useQuery<ReceiptResponse[], HTTPError>({
    queryKey: ["purchaseHistory"],
    retry: false,
    queryFn: async () => {
      if (!token) throw new Error("Missing auth token");
      const response = await kyAspDotnet
        .get("api/Purchase/history", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.array(v.any())), response);
      return parsed.data as ReceiptResponse[];
    },
    onError: (err: any) => {
      if (err?.response?.status === 401) {
        console.warn("⚠️ Token expired or invalid, clearing session...");
        Cookies.remove("token");
        localStorage.removeItem("token");
      }
    },
  });
}

