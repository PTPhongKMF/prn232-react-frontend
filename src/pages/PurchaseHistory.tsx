import { usePurchaseHistory } from "src/hooks/usePayment";
import type { ReceiptResponse } from "src/hooks/usePayment";

export default function PurchaseHistory() {
  const { data: purchases, isLoading, isError, error } = usePurchaseHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-spin h-10 w-10 border-4 border-t-transparent border-blue-500 rounded-full mb-4" />
        <p className="text-gray-600 text-lg">Loading your purchase history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
        <i className="bi bi-exclamation-octagon text-red-500 text-4xl mb-3"></i>
        <p className="text-xl font-semibold text-red-600">Unable to load purchase history</p>
        <p className="text-gray-500 mt-2 text-sm italic">{error?.message}</p>
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-500">
        <i className="bi bi-receipt text-5xl opacity-50 mb-3"></i>
        <p className="text-lg font-medium">No purchase records found</p>
        <p className="text-sm text-gray-400 mt-1">Your purchase history will appear here once you buy something.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-gray-200 pb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="bi bi-clock-history text-blue-600 text-2xl"></i>
          Purchase History
        </h1>
        <span className="mt-2 sm:mt-0 bg-blue-100 text-blue-700 font-semibold text-sm px-3 py-1 rounded-full">
          {purchases.length} record{purchases.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl border border-gray-100">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-3 px-4 text-center">#</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Payment Method</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 min-w-[250px]">Items</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase: ReceiptResponse, index: number) => (
              <tr key={purchase.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-gray-400">{index + 1}</td>
                <td className="py-3 px-4 font-medium text-gray-800">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                  <div className="text-xs text-gray-400">{new Date(purchase.createdAt).toLocaleTimeString()}</div>
                </td>
                <td className="py-3 px-4 text-center text-gray-700">{purchase.paymentMethod}</td>
                <td className="py-3 px-4 text-right text-green-600 font-semibold">${purchase.totalPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      purchase.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : purchase.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : purchase.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  {purchase.purchasedItems?.length > 0 ? (
                    <ul className="space-y-1">
                      {purchase.purchasedItems.map((item) => (
                        <li key={item.slideId} className="truncate">
                          {item.fileUrl ? (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                            >
                              <i className="bi bi-file-earmark-arrow-down"></i>
                              {item.title}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">{item.title} (No file)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">No items</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
