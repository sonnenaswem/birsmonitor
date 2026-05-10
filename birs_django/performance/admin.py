from django.contrib import admin
from .models import PerformanceSummary, PerformanceTarget


@admin.register(PerformanceSummary)
class PerformanceSummaryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "ato_name",
        "total_amount",
        "remita",
        "interswitch",
        "gokollect",
        "date_uploaded",
    )
    search_fields = (
        "ato_name",
        "user__username",
    )
    ordering = ("-date_uploaded",)


@admin.register(PerformanceTarget)
class PerformanceTargetAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "month",
        "year",
        "target_amount",
        "created_at",
    )
    list_filter = (
        "month",
        "year",
    )
    search_fields = (
        "user__username",
    )
    ordering = ("-year", "-month")