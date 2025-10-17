// src/services/ApiService.tsx
import ky from "ky";
import Cookies from "js-cookie";

export const backendUrl = "https://localhost:7035";

export const kyAspDotnet = ky.create({
  prefixUrl: backendUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        const token =
          Cookies.get("token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwtToken");
        if (token) request.headers.set("Authorization", `Bearer ${token}`);
      },
    ],
  },
<<<<<<< HEAD
});

const ApiService = {
  get: (url: string, opts?: any) => kyAspDotnet.get(url, opts),
  post: (url: string, opts?: any) => kyAspDotnet.post(url, opts),
  put: (url: string, opts?: any) => kyAspDotnet.put(url, opts),
  delete: (url: string, opts?: any) => kyAspDotnet.delete(url, opts),
};
export default ApiService;

=======
});
>>>>>>> parent of fa6a721 (Merge pull request #6 from PTPhongKMF/main)
