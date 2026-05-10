from django.urls import path
from .views import (
    ListUsersView,
    UserManagementView,
    ReassignStationView,
    ATODetailView,
    OfficerAccountViewSet,
    SetTargetView,
    CreateAdminAccountView,
)

urlpatterns = [
    # Users listing
    path("", ListUsersView.as_view(), name="users-list"),

    # Create officer
    path("create-officer/", OfficerAccountViewSet.as_view({
        "post": "create"
    }), name="create-officer"),

    # Create admin/director/auditor
    path("create-admin/", CreateAdminAccountView.as_view(), name="create-admin"),

    # Manage user
    path("<int:pk>/manage/", UserManagementView.as_view(), name="manage-user"),

    # Reassign ATO station
    path("<int:pk>/reassign/", ReassignStationView.as_view(), name="reassign-station"),

    # ATO detail
    path("ato/<int:user_id>/", ATODetailView.as_view(), name="ato-detail"),

    # Set target
    path("set-target/", SetTargetView.as_view(), name="set-target"),
]