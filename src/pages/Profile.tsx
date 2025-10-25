import { useProfile, useUpdateProfileMutation, useDeleteAccountMutation } from "src/hooks/useAuth";
import { Loader2, User, Mail, Lock, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "src/components/libs/shadcn/input";
import GenericDeleteDialog from "src/components/GenericDeleteDialog";
import { useNavigate } from "react-router";
import { Cookies } from "typescript-cookie";

export default function Profile() {
  const { data: user, isLoading, isError, error } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, password: "" });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      ...(formData.password && { password: formData.password }),
    };
    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        setFormData((prev) => ({ ...prev, password: "" }));
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        Cookies.remove("token");
        navigate("/login");
      },
      onError: () => {
        setDeleteModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <p className="text-red-500">Error: {error?.message || "Failed to load profile."}</p>
      </div>
    );
  }

  return (
    <>
      <GenericDeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        itemName={user?.name || ""}
        isLoading={deleteAccountMutation.isPending}
      />
      <div className="flex min-h-[100svh] items-center justify-center bg-amber-50 bg-cover px-4 py-24">
        <div className="flex w-full max-w-lg flex-col gap-8">
          <div className="w-full rounded-xl bg-white/80 shadow-lg backdrop-blur-sm">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
              <p className="mt-1 text-gray-500">Manage your personal information and account settings.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 px-8">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="text"
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                {user?.grade && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Grade</label>
                    <div className="relative mt-1">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        readOnly
                        type="number"
                        value={user.grade}
                        className="pl-10 cursor-not-allowed bg-gray-100 text-gray-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between rounded-b-xl bg-gray-50 px-8 py-4">
                <p className="text-sm font-semibold">
                  {updateProfileMutation.isError && (
                    <span className="text-red-500">{updateProfileMutation.error.message}</span>
                  )}
                  {updateProfileMutation.isSuccess && (
                    <span className="text-green-500">Profile updated successfully!</span>
                  )}
                </p>
                <button
                  disabled={updateProfileMutation.isPending}
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>

            {user?.role !== "Admin" && (
              <>
                <div className="border-t border-gray-200"></div>
                <div className="p-8">
                  <h3 className="text-lg font-semibold text-red-700">Delete Account</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600 max-w-sm">
                      Once your account is deleted, all of its resources and data will be permanently removed.
                    </p>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}