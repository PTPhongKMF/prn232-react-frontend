import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";

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


export function usePaymentMethods() {
  return useQuery<PaymentMethod[], HTTPError>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/PaymentMethods").json();
      const parsed = v.parse(
        createApiSuccessResponseSchema(v.array(v.any())),
        response,
      );
      return parsed.data as PaymentMethod[];
    },
  });
}

export function usePurchaseMutation() {
    return useMutation<{data: ReceiptResponse}, HTTPError, { slideIds: number[]; paymentMethodId: number }>({
        mutationFn: async (purchaseData) => {
            const response = await kyAspDotnet
                .post("api/Purchase", {
                    json: purchaseData,
                })
                .json();
            return v.parse(createApiSuccessResponseSchema(v.any()), response);
        },
        onError: (error) => {
            console.error("Purchase failed:", error);
        },
    });
}

export function useUpdateReceiptStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation<unknown, HTTPError, { receiptId: number; status: 'Paid' | 'Failed' }>({
        mutationFn: async ({ receiptId, status }) => {
            return await kyAspDotnet.patch(`api/Purchase/${receiptId}/status`, {
                json: { status },
            }).json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchaseHistory"] });
        },
        onError: (error) => {
            console.error("Status update failed:", error);
        }
    });
}

export function usePurchaseHistory() {
    return useQuery<ReceiptResponse[], HTTPError>({
        queryKey: ["purchaseHistory"],
        queryFn: async () => {
            const response = await kyAspDotnet.get("api/Purchase/history").json();
            const parsed = v.parse(createApiSuccessResponseSchema(v.array(v.any())), response);
            return parsed.data as ReceiptResponse[];
        },
        retry: false,
    });
}