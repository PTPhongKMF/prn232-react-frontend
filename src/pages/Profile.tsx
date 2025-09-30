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
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md grid-rows-[auto_1fr_auto] items-center rounded-3xl border-2 border-yellow-400 bg-gray-50 px-6 py-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)]"
      >
        <div className="flex flex-col items-center justify-center self-start">
          <h3 className="mb-8 text-4xl font-semibold">Your Profile</h3>

          <div className="flex w-full flex-col items-center justify-center gap-6 px-2">
            <div className="flex w-full items-center justify-center gap-2">
              <User />
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <Mail />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <Lock />
              <Input
                type="password"
                placeholder="New Password (optional)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>
             {user?.grade && (
              <div className="flex w-full items-center justify-center gap-2">
                <GraduationCap />
                <Input
                  readOnly
                  type="number"
                  placeholder="Grade"
                  value={user.grade}
                  className="focus-visible:ring-1 bg-gray-200 text-gray-500 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 self-end overflow-auto text-sm font-semibold text-red-500 max-h-14">
            {updateProfileMutation.isError && updateProfileMutation.error.message}
            {updateProfileMutation.isSuccess && (
                <span className="text-green-500">Profile updated successfully!</span>
            )}
        </p>

        <button
          disabled={updateProfileMutation.isPending}
          type="submit"
          className="self-end mb-4 mt-6 w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition active:scale-95 hover:scale-95 hover:shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {updateProfileMutation.isPending ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2 className="animate-spin" /> Saving...
            </div>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}