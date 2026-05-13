from rest_framework.permissions import BasePermission


class IsOversightRole(BasePermission):
    """
    Allows only Admin, Director, or Auditor users.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return getattr(user, "role", "").lower() in [
            "admin",
            "director",
            "auditor"
            "assistant",
        ]