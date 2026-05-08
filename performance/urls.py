from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    performance_summary,
    league_table,
    admin_dashboard,
    generate_monthly_snapshot,
    PerformanceTrendsView,
    MonthlyLeagueSnapshotViewSet,
    export_revenue_csv,
)

router = DefaultRouter()
router.register(
    r"monthly-snapshots",
    MonthlyLeagueSnapshotViewSet,
    basename="monthly-snapshots"
)

urlpatterns = [
    # Officer dashboard summary
    path("summary/", performance_summary, name="performance-summary"),

    # League table
    path("league-table/", league_table, name="league-table"),

    # Admin dashboard
    path("dashboard/", admin_dashboard, name="admin-dashboard"),

    # Generate snapshot
    path("generate-snapshot/", generate_monthly_snapshot, name="generate-monthly-snapshot"),

    # Trends
    path("trends/", PerformanceTrendsView.as_view(), name="performance-trends"),

    # CSV export
    path("export-csv/", export_revenue_csv, name="export-revenue"),
]

urlpatterns += router.urls