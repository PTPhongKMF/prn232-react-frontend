import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useRegisterMutation } from "src/hooks/useAuth";
import { Input } from "src/components/libs/shadcn/input";
import { User, Mail, LockKeyhole, GraduationCap, Loader2Icon } from "lucide-react";

export default function Register() {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    grade: "",
  });

  const navigate = useNavigate();
  const handleRegister = useRegisterMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeAsNumber = registerData.grade ? parseInt(registerData.grade, 10) : undefined;

    handleRegister.mutate(
      { ...registerData, grade: gradeAsNumber },
      {
        onSuccess: () => {
          navigate("/login");
        },
      },
    );
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-amber-50 bg-[url(/imgs/bg/login.png)] bg-cover p-4">
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-md grid-rows-[auto_1fr_auto] items-center rounded-3xl border-2 border-yellow-400 bg-gray-50 px-6 py-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)]"
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center self-start">
          <h3 className="mb-8 text-4xl font-semibold">Create Account</h3>

          {/* Input Fields */}
          <div className="flex w-full flex-col items-center justify-center gap-6 px-2">
            <div className="flex w-full items-center justify-center gap-2">
              <User />
              <Input
                type="text"
                placeholder="Full Name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <Mail />
              <Input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <LockKeyhole />
              <Input
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <GraduationCap />
              <Input
                type="number"
                placeholder="Grade (Example: 7)"
                value={registerData.grade}
                onChange={(e) => setRegisterData({ ...registerData, grade: e.target.value })}
                className="focus-visible:ring-1 bg-gray-50"
                min="1"
                max="12"
              />
            </div>
          </div>
        </div>

        {/* Error/Success Message */}
        <p className="mt-4 self-end overflow-auto text-sm font-semibold text-red-500 max-h-14">
          {handleRegister.isError && handleRegister.error.message}
          {handleRegister.isSuccess && (
            <span className="text-green-500">Registration successful! You can login now.</span>
          )}
        </p>

        {/* Submit Button */}
        <button
          disabled={handleRegister.isPending}
          type="submit"
          className="self-end mb-4 mt-6 w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition active:scale-95 hover:scale-95 hover:shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {handleRegister.isPending ? (
            <div className="flex items-center justify-center gap-4">
              <Loader2Icon className="animate-spin" /> Creating account...
            </div>
          ) : (
            "Register"
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login now
          </Link>
        </p>
      </form>
    </div>
  );
}