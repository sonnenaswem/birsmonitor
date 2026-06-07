from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView
from performance.views import performance_summary
from django.http import HttpResponse
from tax.views import AnalyticsSummaryView

def home(request):
    return HttpResponse("Hello from birs-backend!")

def health(request):
    return HttpResponse("OK")

urlpatterns = [
    path('', home),
    path('health/', health),
    path("admin/", admin.site.urls),

    # Auth
    path(
        "api/auth/login/",
        CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),
    path(
        "api/auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    # App routes
    path("api/users/", include("users.urls")),
    path("api/tax/", include("tax.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/performance/", include("performance.urls")),

    # Legacy alias for frontend compatibility
    path(
        "api/performance-summary/",
        performance_summary,
        name="performance_summary_alias"
    ),
    path("api/analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics-summary")
   

]
