from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from tax.models import TaxEntry
from tax.serializers import TaxEntrySerializer

from django.contrib.auth import get_user_model
from performance.models import PerformanceTarget
from django.db.models import Sum
from datetime import datetime
from .utils.date_utils import get_current_period

month, year = get_current_period()

User = get_user_model()

def health(request):
    return HttpResponse("OK")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_tax_entries(request):
    entries = TaxEntry.objects.filter(user=request.user).order_by("-id")
    serializer = TaxEntrySerializer(entries, many=True)
    return Response(serializer.data)





@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_performance_summary(request):
    now = datetime.now()

    targets = PerformanceTarget.objects.filter(
        month=now.month,
        year=now.year
    )

    results = []

    for t in targets:
        totals = TaxEntry.objects.filter(
            user=t.user,
            month=month,
            year=year
        ).aggregate(
            remita_total=Sum("remita_amount"),
            interswitch_total=Sum("interswitch_amount"),
            gokollect_total=Sum("gokollect_amount")

        )

        achieved = (totals["remita_total"] or 0) + (totals["interswitch_total"] or 0) + (totals["gokollect_total"] or 0)

        results.append({
            "user": t.user.username,
            "target": float(t.target_amount),
            "achieved": float(achieved),
            "percentage": (float(achieved) / float(t.target_amount)) * 100 if t.target_amount > 0 else 0
        })

    return Response(results)