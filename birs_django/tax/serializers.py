from rest_framework import serializers
from .models import TaxEntry, MonthlyLeagueSnapshot, AuditLog
from datetime import date

class TaxEntrySerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    channel = serializers.SerializerMethodField()
    class Meta:
        model = TaxEntry
        fields = [
            'id', 'tax_item', 'subhead', 'taxpayer_name', 
            'date_of_remittance', 'remita', 'interswitch_ref', 'gokollect', 'channel',
            'vehicle_type', 'registration_number', 'source', 
            'remita_verified', 'interswitch_verified', 'gokollect_verified', 
            'remita_amount', 'interswitch_amount', 'gokollect_amount',
            'month', 'year', 'user_full_name', 'area_office', 'total_amount'
        ]
        # FIXED: Use underscore, not hyphen
        read_only_fields = ('area_office', 'total_amount')
        extra_kwargs = {
            'month': {'required': False},
            'year': {'required': False},
        }

    def validate(self, attrs):
        from birs_django.utils.date_utils import get_current_period
        from datetime import date
        
        today = date.today()
        current_month, current_year = get_current_period()
        month_name = today.strftime("%B %Y")
        
        # Check date_of_remittance if provided
        remittance_date = attrs.get("date_of_remittance")
        if remittance_date:
            if remittance_date.month != today.month or remittance_date.year != today.year:
                raise serializers.ValidationError(
                    {"date_of_remittance": f"You can only submit payments for {month_name}."}
                )
        
        # Also validate month/year fields directly (in case date_of_remittance is not provided)
        entry_month = attrs.get('month')
        entry_year = attrs.get('year')
        
        if entry_month is not None and entry_year is not None:
            if entry_month != current_month or entry_year != current_year:
                raise serializers.ValidationError(
                    {"month": f"You can only submit payments for {month_name}."}
                )
        
        return attrs
    
    def get_channel(self, obj):
        if obj.remita:
            return "Remita"
        elif obj.interswitch_ref:
            return "Interswitch"
        elif obj.gokollect:
            return "Gokollect"
        return "-"
    

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