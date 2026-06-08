import axios from "axios";
import { getCookie, setCookie } from "cookies-next";

export async function refreshAccessToken() {
  const refresh = getCookie("refresh");
  if (!refresh) return null;

  try {
    const refreshUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`
      : "/api/auth/token/refresh/";

    const res = await axios.post(
      refreshUrl,
      {
        refresh,
      }
    );

    const newAccess = res.data.access;

    // Save new access token in cookies
    setCookie("access", newAccess, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return newAccess;
  } catch (err) {
    console.error("Failed to refresh token", err);
    return null;
  }
}