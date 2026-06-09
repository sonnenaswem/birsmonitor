from rest_framework import serializers
from .models import TaxEntry, MonthlyLeagueSnapshot, AuditLog


class TaxEntrySerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    channel = serializers.SerializerMethodField()
    display_reference = serializers.SerializerMethodField()
    display_amount = serializers.SerializerMethodField()
    station_name = serializers.SerializerMethodField()
    payment_channel = serializers.SerializerMethodField()

    class Meta:
        model = TaxEntry
        fields = [
            'id', 'tax_item', 'subhead', 'taxpayer_name', 
            'date_of_remittance', 'remita', 'interswitch_ref', 'gokollect', 'channel',
            'vehicle_type', 'registration_number', 'source', 
            'remita_verified', 'interswitch_verified', 'gokollect_verified', 
            'remita_amount', 'interswitch_amount', 'gokollect_amount',
            'month', 'year', 'user_full_name', 'area_office', 'total_amount', 'display_reference', 'display_amount', 'station_name', 'payment_channel',
            
        ]
        # FIXED: Use underscore, not hyphen
        read_only_fields = (
            'area_office',
            'total_amount',
            'taxpayer_name',
            'date_of_remittance',
            'vehicle_type',
            'registration_number',
            'remita_amount',
            'interswitch_amount',
            'gokollect_amount',
            'remita_verified',
            'interswitch_verified',
            'gokollect_verified',
        )
        extra_kwargs = {
            'month': {'required': False},
            'year': {'required': False},
        }
    
    def get_user_full_name(self, obj):
        if not obj.user:
            return ""
        return (
            getattr(obj.user, "full_name", None)
            or f"{obj.user.first_name} {obj.user.last_name}".strip()
            or obj.user.username
        )

    from datetime import date
    from django.conf import settings


    def validate(self, attrs):
        from datetime import date
        from django.conf import settings
        today = date.today()

        remittance_date = attrs.get("date_of_remittance")

        if not remittance_date:
            return attrs

        grace_days = getattr(
            settings,
            "MONTH_SUBMISSION_GRACE_DAYS",
            5
        )

        current_month = today.month
        current_year = today.year

        # PREVIOUS MONTH LOGIC
        if current_month == 1:
            previous_month = 12
            previous_year = current_year - 1
        else:
            previous_month = current_month - 1
            previous_year = current_year

        # ALWAYS ALLOW CURRENT MONTH
        if (
            remittance_date.month == current_month
            and remittance_date.year == current_year
        ):
            return attrs

        # ALLOW PREVIOUS MONTH DURING GRACE WINDOW
        if today.day <= grace_days:
            if (
                remittance_date.month == previous_month
                and remittance_date.year == previous_year
            ):
                return attrs

        raise serializers.ValidationError({
            "date_of_remittance":
                f"You can only submit current month payments "
                f"or previous month payments within the first "
                f"{grace_days} days of a new month."
        })
    
    def get_channel(self, obj):
        if obj.remita:
            return "Remita"
        if obj.interswitch_ref:
            return "Interswitch"
        if obj.gokollect:
            return "Gokollect"

        if obj.external_source == "softnet":
            channel = (
                (obj.softnet_data or {}).get("birsPaymentChannel", "")
                or ""
            ).upper()
            if channel == "REMITA":
                return "Remita"
            if "INTERSWITCH" in channel:
                return "Interswitch"
            if obj.remita_amount and obj.remita_amount > 0:
                return "Remita"
            if obj.interswitch_amount and obj.interswitch_amount > 0:
                return "Interswitch"

        return "-"
    
    def get_display_reference(self, obj):
        return (
            obj.remita
            or obj.interswitch_ref
            or obj.gokollect
            or obj.softnet_reference
            or "N/A"
        )


    def get_display_amount(self, obj):
        return float(
            obj.remita_amount
            or obj.interswitch_amount
            or obj.gokollect_amount
            or obj.total_amount
            or 0
        )


    def get_station_name(self, obj):
        if obj.user:
            return (
                getattr(obj.user, "full_name", None)
                or obj.user.username
                or obj.area_office
            )

        return obj.area_office or "Headquarters"


    def get_payment_channel(self, obj):
        if obj.remita:
            return "Remita"

        if obj.interswitch_ref:
            return "Interswitch"

        if obj.gokollect:
            return "Gokollect"

        return "Unknown"
    

    def validate_remita(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Remita reference must contain only numbers.")
        return value
    

    def update(self, instance, validated_data):
        if instance.source == "POS":
            raise serializers.ValidationError(
                "POS transactions cannot be modified."
            )
        user = self.context['request'].user
        changes = {}

        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != new_value:
                changes[field] = {
                    "old": str(old_value),
                    "new": str(new_value)
                }

        if changes:
            AuditLog.objects.create(
                performed_by=user,
                tax_entry=instance,
                action="update",
                changes=changes
            )

        return super().update(instance, validated_data)


class MonthlyLeagueSnapshotSerializer(serializers.ModelSerializer):
    top5 = serializers.SerializerMethodField()
    bottom5 = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    avg_percent = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyLeagueSnapshot
        fields = [
            'id', 'month', 'year', 'data', 'created_at', 
            'top5', 'bottom5', 'grand_total', 'avg_percent'
        ]

    def get_top5(self, obj):
        
        league_sorted = sorted(obj.data, key=lambda x: x.get("percent", 0), reverse=True)
        return league_sorted[:5]

    def get_bottom5(self, obj):
        league_sorted = sorted(obj.data, key=lambda x: x.get("percent", 0), reverse=True)
        return league_sorted[-5:] if len(league_sorted) >= 5 else league_sorted

    def get_grand_total(self, obj):
        return sum([row.get("collected", 0) for row in obj.data])

    def get_avg_percent(self, obj):
        percents = [row.get("percent", 0) for row in obj.data if row.get("percent") is not None]
        return round(sum(percents) / len(percents), 2) if percents else 0