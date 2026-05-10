import { deleteCookie } from "cookies-next";

export function logout() {
  // Clear cookies
  deleteCookie("access");
  deleteCookie("refresh");

  // Redirect to login
  window.location.href = "/";
}