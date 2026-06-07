from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    TaxEntryViewSet,
    TaxEntryActionView,
    AnalyticsSummaryView,
    ATOItemBreakdownView,
    UserTaxEntriesView,
    softnet_webhook,
    gokollect_webhook,
    tax_item_aggregate,
)


router = DefaultRouter()
router.register(r"entries", TaxEntryViewSet, basename="tax-entry")

urlpatterns = [
    # Current user entries
    path("my-entries/", UserTaxEntriesView.as_view(), name="my-tax-entries"),

    # Delete action
    path("entries/<int:pk>/delete/", TaxEntryActionView.as_view(), name="delete-tax-entry"),

    # Analytics
    path("analytics/", AnalyticsSummaryView.as_view(), name="analytics-summary"),

    # Tax item aggregation
    path("tax-item-aggregate/", tax_item_aggregate, name="tax-item-aggregate"),

    # ATO breakdown
    path("ato/<int:ato_id>/breakdown/", ATOItemBreakdownView.as_view(), name="ato-item-breakdown"),

    # Webhooks
    path(
        "softnet/webhook/",
        softnet_webhook,
        name="softnet-webhook",
    ),
    path("webhooks/gokollect/", gokollect_webhook, name="gokollect-webhook"),
]

urlpatterns += router.urls