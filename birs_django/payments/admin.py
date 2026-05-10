from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reference",
        "user",
        "channel",
        "amount",
        "status",
        "payment_date",
        "created_at",
    )
    list_filter = (
        "channel",
        "status",
        "source",
    )
    search_fields = (
        "reference",
        "payer_name",
        "user__username",
    )
    ordering = ("-created_at",)