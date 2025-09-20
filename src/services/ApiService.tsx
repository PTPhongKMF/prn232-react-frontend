import ky from "ky";
import { Cookies } from "typescript-cookie";

const KyAspDotnet_LOCAL = "https://localhost:7035/";
// const KyAspDotnet_WEB = "";

export const kyAspDotnet = ky.extend({
  prefixUrl: KyAspDotnet_LOCAL,
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
