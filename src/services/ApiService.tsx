import ky from "ky";
import { Cookies } from "typescript-cookie";

const KyAspDotnet_LOCAL = "https://localhost:7035/";

export const backendUrl = KyAspDotnet_LOCAL;

export const kyAspDotnet = ky.extend({
  prefixUrl: backendUrl,
  timeout: 60000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = Cookies.get("token");

        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
  },
});
