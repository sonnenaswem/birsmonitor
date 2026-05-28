from django.contrib import admin
from .models import (
    TaxEntry,
    MonthlyLeagueSnapshot,
    PosTerminal,
    GokollectInstitutionMapping,
    AuditLog,
)


@admin.register(TaxEntry)
class TaxEntryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "tax_item",
        "taxpayer_name",
        "remita",
        "interswitch_ref",
        "gokollect",
        "total_amount",
        "source",
        "date_uploaded",
    )
    list_filter = (
        "source",
        "month",
        "year",
    )
    search_fields = (
        "taxpayer_name",
        "tax_item",
        "remita",
        "interswitch_ref",
        "gokollect",
    )
    ordering = ("-date_uploaded",)


@admin.register(MonthlyLeagueSnapshot)
class MonthlyLeagueSnapshotAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "month",
        "year",
        "created_at",
    )
    ordering = ("-year", "-month")


@admin.register(GokollectInstitutionMapping)
class GokollectInstitutionMappingAdmin(admin.ModelAdmin):
    list_display = (
        "institution_name",
        "institution_code",
        "ato",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "institution_name",
        "institution_code",
        "ato__username",
    )


@admin.register(PosTerminal)
class PosTerminalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "terminal_id",
        "ato",
        "channel",
        "provider",
        "branch_name",
        "station_name",
        "is_active",
        "created_at",
    )
    list_filter = (
        "is_active",
        "channel",
        "provider",
    )

    search_fields = (
        "terminal_id",
        "ato__username",
        "branch_name",
        "provider",
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "performed_by",
        "tax_entry",
        "action",
        "timestamp",
    )
    list_filter = (
        "action",
    )
    ordering = ("-timestamp",)