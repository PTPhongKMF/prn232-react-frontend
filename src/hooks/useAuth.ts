import { useMutation } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { FailApiResponseSchema } from "src/types/response";
import * as v from "valibot";

const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.minLength(1, "Email không được để trống"),
    v.email("Email không hợp lệ"),
  ),
  password: v.pipe(v.string(), v.minLength(1, "Mật khẩu không được để trống")),
});

type LoginData = v.InferOutput<typeof LoginSchema>;

export function useLoginMutation() {
  return useMutation<unknown, HTTPError, LoginData>({
    mutationFn: async (loginData: LoginData) => {
      console.log(loginData);

      v.parse(LoginSchema, loginData);

      return await kyAspDotnet
        .post("api/Accounts/login", {
          json: {
            email: loginData.email,
            password: loginData.password,
          },
          hooks: {
            beforeError: [
              async (error) => {
                const errorBody = await error.response.json();

                const errorResponse = v.parse(
                  FailApiResponseSchema,
                  errorBody,
                  { message: "Lỗi không xác định." },
                );

                error.message = errorResponse.message;

                return error;
              },
            ],
          },
        })
        .json();
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });
}
