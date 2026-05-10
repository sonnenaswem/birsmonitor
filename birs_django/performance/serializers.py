from rest_framework import serializers
from tax.models import MonthlyLeagueSnapshot
from tax.serializers import MonthlyLeagueSnapshotSerializer

class PerformanceSummarySerializer(serializers.Serializer):
    target = serializers.FloatField()
    pos_total = serializers.FloatField()
    manual_total = serializers.FloatField()
    grand_total = serializers.FloatField()
    percent_met = serializers.FloatField()
    chart_labels = serializers.ListField(child=serializers.CharField())
    pos_values = serializers.ListField(child=serializers.FloatField())
    manual_values = serializers.ListField(child=serializers.FloatField())
    total_values = serializers.ListField(child=serializers.FloatField())


class LeagueEntrySerializer(serializers.Serializer):
    ato_id = serializers.IntegerField()
    ato_name = serializers.CharField()
    remita_total = serializers.FloatField()
    interswitch_total = serializers.FloatField()
    gokollect_total = serializers.FloatField()
    target = serializers.FloatField()
    actual = serializers.FloatField()
    percent = serializers.FloatField()


