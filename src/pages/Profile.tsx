import { useProfile, useUpdateProfileMutation } from "src/hooks/useAuth";
import { Loader2, User, Mail, Lock, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "src/components/libs/shadcn/input";

export default function Profile() {
  const { data: user, isLoading, isError, error } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    <div className="flex min-h-[100svh] items-center justify-center bg-amber-50 bg-[url(/imgs/bg/login.png)] bg-cover p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>
            <p className="mt-1 text-gray-500">Keep your account information up to date.</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name Input */}
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

            {/* Email Input */}
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

            {/* New Password Input */}
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

            {/* Grade Display (Read-only) */}
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

          {/* Form Footer: Messages and Submit Button */}
          <div className="mt-2 text-center">
            <p className="min-h-[1.25rem] text-sm font-semibold">
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
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
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
      </div>
    </div>
  );
}