import { Loader2Icon, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Input } from "src/components/libs/shadcn/input";
import { useLoginMutation } from "src/hooks/useAuth";

export default function Login() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = useLoginMutation();

  return (
    <div
      className="flex justify-center items-center size-full bg-[url(/imgs/bg/login.png)] min-h-[100svh] bg-cover 
    bg-amber-50"
    >
      <form
        className="grid grid-rows-[auto_1fr_auto] px-6  items-center bg-gray-50 h-120 w-100 rounded-3xl border-2 
        border-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)]"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin.mutate(loginData);
        }}
      >
        <div className="flex flex-col justify-center items-center w-full self-start">
          <h3 className="text-4xl font-semibold mt-10 mb-26">Đăng nhập</h3>

          <div className="flex flex-col gap-6 justify-center items-center size-full px-2">
            <div className="flex gap-2 justify-center items-center w-full">
              <Mail />
              <Input
                className="focus-visible:ring-1 bg-gray-50"
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-center items-center w-full">
              <LockKeyhole />
              <Input
                className="focus-visible:ring-1 bg-gray-50"
                type="password"
                placeholder="Mật khẩu"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <p className="self-end text-red-500 font-semibold text-sm max-h-20 overflow-auto">
          {handleLogin.isError && handleLogin.error.message}
          {handleLogin.isSuccess && (
            <span className="text-green-500">đăng nhập thành công</span>
          )}
        </p>

        <button
          disabled={handleLogin.isPending}
          className="mt-8 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md 
             transform transition active:scale-95 hover:scale-95 
             hover:shadow-sm focus:outline-none  mb-4 cursor-pointer self-end
             disabled:bg-gray-400 disabled:cursor-not-allowed"
          type="submit"
        >
          {handleLogin.isPending ? (
            <div className="flex justify-center items-center gap-4">
              <Loader2Icon className="animate-spin" /> Đang đăng nhập
            </div>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>
    </div>
  );
}