import { useUsers, useUpdateUserPermissionsMutation, useDeleteUserMutation } from "src/hooks/useAdmin";
import { Loader2, Save, CircleCheck, CircleAlert, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useProfile, type User } from "src/hooks/useAuth";
import { Input } from "src/components/libs/shadcn/input";
import { cn } from "src/utils/cn";
import DeleteConfirmationModal from "src/components/DeleteConfirmationModal";

type Feedback = {
  message: string;
  type: "success" | "error";
} | null;

const USERS_PER_PAGE = 10;
const gradeOptions = Array.from({ length: 12 }, (_, i) => i + 1); // Grade options 1-12

export default function Admin() {
  const { data: currentUser } = useProfile();
  const { data: users, isLoading, isError, error } = useUsers();
  const [editingUsers, setEditingUsers] = useState<Record<number, Partial<User>>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const updateUserPermissionsMutation = useUpdateUserPermissionsMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const totalPages = users ? Math.ceil(users.length / USERS_PER_PAGE) : 0;
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = users ? users.slice(indexOfFirstUser, indexOfLastUser) : [];

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleFieldChange = (userId: number, field: "role" | "grade", value: string | number | null) => {
    setEditingUsers((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value === "" ? null : value },
    }));
  };

  const handleSave = (userId: number) => {
    const originalUser = users?.find(u => u.id === userId);
    const changes = editingUsers[userId];

    if (originalUser && changes) {
      const payload = {
        userId,
        role: changes.role ?? originalUser.role,
        grade: "grade" in changes ? changes.grade : originalUser.grade,
      };

      updateUserPermissionsMutation.mutate(payload, {
        onSuccess: () => {
          setFeedback({ message: "User updated successfully!", type: "success" });
          setEditingUsers((prev) => {
            const newEditing = { ...prev };
            delete newEditing[userId];
            return newEditing;
          });
        },
        onError: (err) => {
          setFeedback({ message: err.message || "Failed to update user.", type: "error" });
        },
      });
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ userId: userToDelete.id }, {
        onSuccess: () => {
          setFeedback({ message: "User deleted successfully!", type: "success" });
          setUserToDelete(null);
        },
        onError: (err) => {
          setFeedback({ message: err.message || "Failed to delete user.", type: "error" });
          setUserToDelete(null);
        }
      });
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <p className="text-red-500">Error: {error?.message || "Failed to load users."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        userName={userToDelete?.name || ""}
      />
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">User Management</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            A list of all the users in the system including their name, email and role.
          </p>
        </div>

        {feedback && (
          <div className={cn("mt-4 rounded-md p-4 text-sm", {
            "bg-green-50 text-green-800": feedback.type === 'success',
            "bg-red-50 text-red-800": feedback.type === 'error',
          })}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flow-root">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-1/3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grade</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentUsers.map((user) => {
                    const isAdminRow = user.id === currentUser.id || user.role === 'Admin';
                    return (
                      <tr key={user.id} className="align-middle">
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="mt-1 text-gray-500">{user.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          <select
                            value={editingUsers[user.id]?.role ?? user.role}
                            onChange={(e) => handleFieldChange(user.id, "role", e.target.value)}
                            disabled={isAdminRow}
                            className={cn(
                              "file:text-foreground placeholder:text-muted-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            )}
                          >
                            <option>Student</option>
                            <option>Teacher</option>
                            <option>Admin</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          <select
                            value={editingUsers[user.id]?.grade ?? user.grade ?? ""}
                            onChange={(e) => handleFieldChange(user.id, "grade", e.target.value)}
                            disabled={isAdminRow}
                            className={cn(
                              "w-32 file:text-foreground placeholder:text-muted-foreground border-input h-9 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            )}
                          >
                            <option value="">N/A</option>
                            {gradeOptions.map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {!isAdminRow && (
                            <div className="flex items-center justify-end gap-x-2">
                               <button
                                onClick={() => handleSave(user.id)}
                                disabled={!editingUsers[user.id] || (updateUserPermissionsMutation.isPending && updateUserPermissionsMutation.variables?.userId === user.id)}
                                className="inline-flex w-24 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {updateUserPermissionsMutation.isPending && updateUserPermissionsMutation.variables?.userId === user.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <Save size={16} />
                                    <span>Save</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                 <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                 <div className="flex flex-1 justify-between sm:hidden">
                   <button
                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                     disabled={currentPage === 1}
                     className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                   >
                     Previous
                   </button>
                   <button
                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                     disabled={currentPage === totalPages}
                     className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                   >
                     Next
                   </button>
                 </div>
                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                   <div>
                     {users && (
                       <p className="text-sm text-gray-700">
                         Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to <span className="font-medium">{Math.min(indexOfLastUser, users.length)}</span> of{' '}
                         <span className="font-medium">{users.length}</span> results
                       </p>
                     )}
                   </div>
                   <div>
                     <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                       <button
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                         disabled={currentPage === 1}
                         className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                       >
                         <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                         <span>Previous</span>
                       </button>
                       <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                         Page {currentPage} of {totalPages}
                       </span>
                       <button
                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                         disabled={currentPage === totalPages}
                         className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                       >
                          <span>Next</span>
                         <ChevronRight className="h-5 w-5" aria-hidden="true" />
                       </button>
                     </nav>
                   </div>
                 </div>
               </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}