import { usePurchaseHistory, type ReceiptResponse } from "../hooks/usePayment";
import { Loader2, FileWarning, ShoppingBag, Download } from "lucide-react";
import { backendUrl } from "../services/ApiService";

export default function MyLibrary() {
    const { data: history, isLoading, isError, error } = usePurchaseHistory();

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100svh-10rem)] items-center justify-center bg-amber-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[calc(100svh-10rem)] flex-col items-center justify-center bg-amber-50 text-center">
                <FileWarning className="h-16 w-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load Purchase History</h2>
                <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
            </div>
        );
    }

    const allPurchasedItems = (history as ReceiptResponse[])?.flatMap(receipt => receipt.purchasedItems).filter(item => item) ?? [];

    return (
        <div className="min-h-screen bg-amber-50">
            <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="pb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">My Library</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                        All of your purchased slides are available for download here.
                    </p>
                </div>

                {allPurchasedItems.length > 0 ? (
                    <div className="mx-auto max-w-4xl">
                        <ul className="divide-y divide-gray-200 rounded-lg border bg-white shadow-sm">
                            {allPurchasedItems.map((item) => (
                                <li key={item.slideId} className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                                    <span className="font-semibold text-gray-800">{item.title}</span>
                                    {item.fileUrl ? (
                                        <a
                                            href={`${backendUrl.slice(0, -1)}${item.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                        >
                                            <Download size={16} />
                                            Download
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400">No file available</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-24 text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-400" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Your Library is Empty</h2>
                        <p className="mt-2 text-gray-500">You haven't purchased any slides yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}