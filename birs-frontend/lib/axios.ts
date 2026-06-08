import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});


// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    // Read cookie manually — cookies-next can be unreliable in browser context
    let access: string | undefined;

    if (typeof document !== "undefined") {
      const match = document.cookie
        .split(";")
        .find(c => c.trim().startsWith("access="));
      if (match) {
        access = match.split("=").slice(1).join("=").trim();
      }
    }

    // Fall back to cookies-next, then localStorage
    if (!access) {
      const cookieVal = getCookie("access");
      access = typeof cookieVal === "string" ? cookieVal : undefined;
    }

    if (!access && typeof localStorage !== "undefined") {
      access = localStorage.getItem("token") ?? undefined;
    }

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ===============================
// REFRESH ACCESS TOKEN
// ===============================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const refreshAccessToken = async () => {
  try {
    const refresh = getCookie("refresh");

    if (!refresh) {
      return null;
    }

    const refreshUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`
      : "/api/auth/token/refresh/";

    const response = await axios.post(
      refreshUrl,
      {
        refresh,
      },
      {
        withCredentials: true,
      }
    );

    const newAccess = response.data.access;

    setCookie("access", newAccess, {
      maxAge: 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    localStorage.setItem("token", newAccess);

    return newAccess;
  } catch (error) {
    deleteCookie("access");
    deleteCookie("refresh");
    localStorage.removeItem("token");

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return null;
  }
};


// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login/")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newAccess = await refreshAccessToken();

        if (!newAccess) {
          return Promise.reject(error);
        }

        onRefreshed(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;