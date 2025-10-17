// src/services/ApiService.tsx
import ky from "ky";
import Cookies from "js-cookie";

export const backendUrl = "https://localhost:7035";

export const kyAspDotnet = ky.create({
  prefixUrl: backendUrl,
  timeout: 60000,
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
});

