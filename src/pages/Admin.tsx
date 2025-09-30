import { useQuery } from "@tanstack/react-query";
import { kyAspDotnet } from "src/services/ApiService";
import { genericApiResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";
import { ShieldCheck, User, Mail, GraduationCap, Loader2, Edit, X, Check } from "lucide-react";
import type { User as UserType } from "src/hooks/useAuth";
import { useProfile, useAdminUpdateUserMutation } from "src/hooks/useAuth";
import { useState } from "react";

// Hook to fetch all users
function useAllUsers() {
  return useQuery<UserType[], Error>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/Admin/users").json();
      const parsed = v.parse(genericApiResponseSchema(v.array(v.any())), response);
      return parsed.data as UserType[];
    },
    retry: false,
  });
}

export default function Admin() {
  const { data: users, isLoading, isError, error } = useAllUsers();
  const { data: currentUser } = useProfile();
  const updateUserMutation = useAdminUpdateUserMutation();

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editableUserData, setEditableUserData] = useState<Partial<UserType>>({});

  const handleEditClick = (user: UserType) => {
    setEditingUserId(user.id);
    setEditableUserData({ role: user.role, grade: user.grade });
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setEditableUserData({});
  };

  const handleSave = (userId: number) => {
    if (!editableUserData.role) return;

    const grade = editableUserData.grade ? Number(editableUserData.grade) : null;
    const role = editableUserData.role as "Admin" | "Teacher" | "Student";

    updateUserMutation.mutate(
      { userId, userData: { role, grade } },
      {
        onSuccess: () => {
          handleCancel();
        },
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableUserData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-amber-50 pt-16">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-amber-50 pt-16">
        <p className="text-red-500">Error: {error?.message || "Failed to load users."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-amber-50 pt-16">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Manage all users in the system.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200">
              <thead className="bg-amber-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-800"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Name
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-800"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-800"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Role
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-800"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Grade
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-amber-800"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {users?.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-amber-50/70"}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {editingUserId === user.id ? (
                        <select
                          name="role"
                          aria-label={`Role for ${user.name}`}
                          value={editableUserData.role}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                        >
                          <option>Student</option>
                          <option>Teacher</option>
                          <option>Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
                            user.role === "Admin"
                              ? "bg-green-100 text-green-800"
                              : user.role === "Teacher"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {editingUserId === user.id ? (
                        <input
                          type="number"
                          name="grade"
                          aria-label={`Grade for ${user.name}`}
                          value={editableUserData.grade ?? ""}
                          onChange={handleInputChange}
                          className="block w-24 rounded-md border-gray-300 py-1.5 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                          min="1"
                          max="12"
                        />
                      ) : (
                        user.grade || "N/A"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center justify-center gap-4">
                        {editingUserId === user.id ? (
                          <>
                            <button
                              onClick={() => handleSave(user.id)}
                              disabled={updateUserMutation.isPending}
                              className="text-green-600 transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:text-gray-400"
                              title="Save"
                            >
                              {updateUserMutation.isPending && editingUserId === user.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Check className="h-6 w-6" />
                              )}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 transition-transform hover:scale-125"
                              title="Cancel"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(user)}
                            disabled={currentUser?.id === user.id}
                            className="text-indigo-600 transition-transform hover:scale-125 disabled:cursor-not-allowed disabled:text-gray-400"
                            title="Edit User"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
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
  );
}