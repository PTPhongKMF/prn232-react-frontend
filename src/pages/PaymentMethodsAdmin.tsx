import { useState } from "react";
import {
  usePaymentMethods,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  type PaymentMethod,
} from "../hooks/usePayment";
import { Loader2, Save, Trash2, PlusCircle, Edit, X } from "lucide-react";
import { Input } from "../components/libs/shadcn/input";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function PaymentMethodsAdmin() {
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const createMutation = useCreatePaymentMethodMutation();
  const updateMutation = useUpdatePaymentMethodMutation();
  const deleteMutation = useDeletePaymentMethodMutation();

  const [newMethodName, setNewMethodName] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMethodName.trim()) {
      createMutation.mutate({ name: newMethodName.trim() }, {
        onSuccess: () => setNewMethodName(""),
      });
    }
  };

  const handleUpdate = () => {
    if (editingMethod && editingMethod.name.trim()) {
      updateMutation.mutate(editingMethod, {
        onSuccess: () => setEditingMethod(null),
      });
    }
  };
  
  const handleDelete = (method: PaymentMethod) => {
    setMethodToDelete(method);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      deleteMutation.mutate(methodToDelete.id, {
        onSuccess: () => setMethodToDelete(null),
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
       <DeleteConfirmationModal
        isOpen={!!methodToDelete}
        onClose={() => setMethodToDelete(null)}
        onConfirm={confirmDelete}
        userName={methodToDelete?.name || ""}
      />
      <div className="mx-auto max-w-4xl">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Payment Methods</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Manage the available payment methods for purchasing slides.
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Add New Method</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="e.g., Credit Card, PayPal..."
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              className="flex-grow"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || !newMethodName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              <span>Add Method</span>
            </button>
          </div>
          {createMutation.isError && <p className="mt-2 text-sm text-red-500">{createMutation.error.message}</p>}
        </form>

        {/* Methods List */}
        <div className="mt-8 flow-root">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paymentMethods?.map((method) => (
                    <tr key={method.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        {editingMethod?.id === method.id ? (
                          <Input
                            value={editingMethod.name}
                            onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{method.name}</div>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-x-2">
                          {editingMethod?.id === method.id ? (
                            <>
                              <button onClick={handleUpdate} disabled={updateMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-gray-400">
                                {updateMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                                <span>Save</span>
                              </button>
                              <button onClick={() => setEditingMethod(null)} className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300">
                                <X size={16} />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingMethod(method)} className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400">
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button onClick={() => handleDelete(method)} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}