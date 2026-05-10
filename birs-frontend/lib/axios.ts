import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});


// ✅ RELIABLE COOKIE READER (FIXES YOUR ISSUE)
function getAccessTokenFromCookie() {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access="));

  return match ? match.split("=")[1] : null;
}


// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const access = getAccessTokenFromCookie();

  console.log("🔐 Sending token:", access);

  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});


// 🔄 REFRESH TOKEN FUNCTION
const refreshAccessToken = async () => {
  try {
    const refresh = getCookie("refresh");

    if (!refresh) {
      console.log("❌ No refresh token found");
      return null;
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`,
      { refresh }
    );

    const newAccess = res.data.access;

    console.log("♻️ Token refreshed");

    setCookie("access", newAccess, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return newAccess;
  } catch (err) {
    console.log("❌ Refresh token failed");

    // ❌ Kill session if refresh fails
    deleteCookie("access");
    deleteCookie("refresh");

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return null;
  }
};


// 🚨 RESPONSE INTERCEPTOR (AUTO REFRESH)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 Prevent retry loops
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("/auth/login/")
    ) {
      originalRequest._retry = true;

      console.log("⚠️ 401 detected, attempting refresh...");

      const newAccess = await refreshAccessToken();

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;