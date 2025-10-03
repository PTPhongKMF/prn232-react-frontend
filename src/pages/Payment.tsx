import { useState } from "react";
import { useCart } from "src/stores/cartStore";
import { usePaymentMethods, usePurchaseMutation, useUpdateReceiptStatusMutation } from "src/hooks/usePayment";
import {
  Loader2,
  CreditCard,
  Trash2,
  FileWarning,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Payment() {
  const { items, removeFromCart, clearCart } = useCart();
  const { data: paymentMethods, isLoading: isLoadingMethods } = usePaymentMethods();
  const purchaseMutation = usePurchaseMutation();
  const updateStatusMutation = useUpdateReceiptStatusMutation();
  const navigate = useNavigate();

  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  const handlePurchase = async () => {
    if (!selectedMethodId) {
      alert("Please select a payment method.");
      return;
    }
    const slideIds = items.map((item) => item.id);

    try {
      // 1. Create a pending receipt
      const receiptResponse = await purchaseMutation.mutateAsync({
        slideIds,
        paymentMethodId: selectedMethodId,
      });

      // 2. Simulate payment processing
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5-second delay for sandbox simulation

      // 3. Update the receipt status to "Paid"
      await updateStatusMutation.mutateAsync({
        receiptId: receiptResponse.data.id,
        status: 'Paid',
      });

      // 4. Show success and clear cart
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();

    } catch (error) {
      console.error("Payment process failed:", error);
      setIsProcessing(false); // Make sure to stop processing on error
    }
  };

  if (isSuccess) {
    return (
        <div className="flex min-h-[calc(100svh-10rem)] items-center justify-center bg-amber-50 px-4 py-24 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-white p-8 text-center shadow-lg">
                <CircleCheck className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Payment Successful!</h2>
                <p className="mt-2 text-gray-600">Your order has been completed. You can now access your purchased slides.</p>
                <button
                    onClick={() => navigate('/explore')}
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

        <div className="mt-8">
          {items.length > 0 ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <ul className="mt-4 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          by {item.teacher.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">
                          ${item.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-end border-t pt-4">
                  <p className="text-lg font-bold">
                    Total: ${totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                {isLoadingMethods ? (
                  <Loader2 className="mt-4 animate-spin" />
                ) : (
                  <div className="mt-4 space-y-3">
                    {paymentMethods?.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-all ${
                          selectedMethodId === method.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <CreditCard className="text-gray-500" />
                        <span className="font-medium">{method.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {purchaseMutation.isError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-600">
                      <CircleAlert size={18} />
                      <span>{purchaseMutation.error.message || "An error occurred during purchase."}</span>
                  </div>
              )}
              {updateStatusMutation.isError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-600">
                      <CircleAlert size={18} />
                      <span>{updateStatusMutation.error.message || "An error occurred while confirming payment."}</span>
                  </div>
              )}


              <div className="flex justify-end">
                <button
                  onClick={handlePurchase}
                  disabled={!selectedMethodId || purchaseMutation.isPending || isProcessing}
                  className="inline-flex min-w-[150px] items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Purchase"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <FileWarning className="h-20 w-20 text-gray-400" />
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                Your Cart is Empty
              </h2>
              <p className="mt-2 text-gray-500">
                Looks like you haven't added any slides to your cart yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}