import calendar
import logging
from django.db.models import Q
from rest_framework import viewsets, status, permissions, generics
from .models import TaxEntry, MonthlyLeagueSnapshot, PosTerminal
from users.models import CustomUser
from performance.models import PerformanceSummary
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .serializers import TaxEntrySerializer
from performance.models import PerformanceTarget
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.db.models import Sum, DecimalField, Value
from django.utils import timezone 
from rest_framework import serializers
from performance.serializers import PerformanceSummarySerializer
from django.db.models.functions import Coalesce
from .serializers import (
    TaxEntrySerializer,
   
)
from django.conf import settings
from tax.tasks import process_softnet_webhook_task
from birs_django.utils.date_utils  import get_current_period
from rest_framework.pagination import PageNumberPagination
from datetime import datetime


logger = logging.getLogger(__name__)

class TaxEntryPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 100

class PerformanceSummaryViewSet(viewsets.ModelViewSet):
    queryset = PerformanceSummary.objects.all()
    serializer_class = PerformanceSummarySerializer


class TaxEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TaxEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = TaxEntryPagination

    def get_queryset(self):
        user = self.request.user

        queryset = (
            TaxEntry.objects
            .select_related("user")
        )

        from_date = self.request.GET.get("from_date")
        to_date = self.request.GET.get("to_date")

        if from_date and to_date:
            queryset = queryset.filter(
                date_of_remittance__range=[
                    from_date,
                    to_date
                ]
            )

        search_query = self.request.GET.get("search")
        if search_query:
            search_query = search_query.strip()
            normalized_search = search_query.lower().replace(" ", "").replace("-", "").replace("_", "")
            channel_filter = None

            if "interswitch" in normalized_search:
                channel_filter = Q(interswitch_ref__isnull=False)
            elif "remita" in normalized_search:
                channel_filter = Q(remita__isnull=False)
            elif "gokollect" in normalized_search:
                channel_filter = Q(gokollect__isnull=False)

            search_filter = (
                Q(area_office__icontains=search_query) |
                Q(taxpayer_name__icontains=search_query) |
                Q(tax_item__icontains=search_query) |
                Q(remita__icontains=search_query) |
                Q(interswitch_ref__icontains=search_query) |
                Q(gokollect__icontains=search_query) |
                Q(registration_number__icontains=search_query) |
                Q(vehicle_type__icontains=search_query) |
                Q(source__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query)
            )

            if channel_filter is not None:
                queryset = queryset.filter(search_filter | channel_filter)
            else:
                queryset = queryset.filter(search_filter)

        if not user.is_staff:
            queryset = queryset.filter(
                user=user
            )

        return queryset.order_by(
            "-date_of_remittance",
            "-id"
        )

    def perform_create(self, serializer):
        from birs_django.utils.date_utils import get_current_period

        remittance_date = serializer.validated_data.get("date_of_remittance")

        user_area_office = (
            getattr(self.request.user, "area_office", None)
            or getattr(self.request.user, "username", None)
        )

        if not user_area_office:
            raise serializers.ValidationError({
                "area_office": "This user has no assigned area office."
            })

        current_month, current_year = get_current_period()

        if remittance_date:
            serializer.save(
                month=remittance_date.month,
                year=remittance_date.year,
                user=self.request.user,
                area_office=user_area_office,
            )
        else:
            serializer.save(
                month=current_month,
                year=current_year,
                user=self.request.user,
                area_office=user_area_office,
            )


class TaxEntryActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        # 1. Check Permissions: Only Admin and Auditor can delete
        user_role = (getattr(request.user, "role", "") or "").lower()

        if user_role not in ["admin", "auditor"]:
            return Response(
                {"error": "Access Denied. Only Auditors or Admins can remove entries."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        entry = get_object_or_404(TaxEntry, pk=pk)

        # 2. Check Source: POS is Immutable
        if entry.source == 'POS':
            return Response(
                {"error": "Integrity Violation: POS transactions are verified and cannot be deleted."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Execution: Manual entries can be removed
        # (Optional: If you want to allow the reference to be used again, hard delete is fine)
        entry.delete() 
        
        return Response(
            {"message": "Manual entry removed successfully. Reference is now released."}, 
            status=status.HTTP_204_NO_CONTENT
        )


        

@api_view(["POST"])
@permission_classes([AllowAny])
def softnet_webhook(request):

    incoming_client_id = request.headers.get(
        "clientId"
    )

    expected_client_id = settings.SOFTNET_CLIENT_ID

    if not incoming_client_id:

        logger.warning(
            "Softnet webhook missing clientId header"
        )

        return Response(
            {
                "success": False,
                "message": "Missing clientId header"
            },
            status=401
        )

    if incoming_client_id != expected_client_id:

        logger.warning(
            f"Unauthorized Softnet webhook attempt: "
            f"{incoming_client_id}"
        )

        return Response(
            {
                "success": False,
                "message": "Unauthorized webhook"
            },
            status=401
        )

    payload = request.data

    try:

        process_softnet_webhook_task.delay(
            payload
        )

        logger.info(
            "Softnet webhook accepted successfully"
        )

        return Response(
            {
                "success": True,
                "message": "Webhook received"
            },
            status=200
        )

    except Exception as e:

        logger.exception(
            f"Softnet webhook processing failed: {str(e)}"
        )

        return Response(
            {
                "success": False,
                "message": "Webhook processing failed"
            },
            status=500
        )


@api_view(["POST"])
@permission_classes([])  # Secure later with signature validation
def gokollect_webhook(request):
    collector_code = (
        request.data.get("collector_code")
        or request.data.get("agent_code")
        or request.data.get("merchant_code")
    )
    reference = request.data.get("reference")
    amount = request.data.get("amount")
    taxpayer_name = request.data.get("taxpayer_name")
    tax_item = request.data.get("tax_item")
    terminal_id = request.data.get("terminal_id")
    payment_date = request.data.get("payment_date")

    # Require at least one routing identifier
    if not collector_code and not terminal_id:
        return Response(
            {
                "error": (
                    "collector_code or terminal_id is required"
                )
            },
            status=400
        )

    if not reference:
        return Response(
            {"error": "reference is required"},
            status=400
        )

    # Normalize collector code
    if collector_code:
        collector_code = collector_code.strip().upper()

    # Attempt terminal resolution first
    terminal = None

    if terminal_id:
        terminal = PosTerminal.objects.filter(
            terminal_id=terminal_id.strip().upper(),
            is_active=True
        ).select_related("ato").first()

    ato = None

    # Priority 1: Terminal mapping
    if terminal:
        ato = terminal.ato

    # Priority 2: Collector code mapping
    elif collector_code:
        ato = CustomUser.objects.filter(
            gokollect_code=collector_code,
            role="ato"
        ).first()

    if not ato:
        return Response(
            {
                "error": "Unable to resolve ATO from terminal or collector code"
            },
            status=404
        )

    # Prevent duplicates
    if TaxEntry.objects.filter(gokollect=reference).exists():
        return Response({"status": "duplicate_ignored"})

    # Parse payment date
    try:
        payment_dt = datetime.strptime(payment_date, "%Y-%m-%d")
    except Exception:
        return Response(
            {"error": "Invalid payment_date format. Use YYYY-MM-DD"},
            status=400
        )

    # Create tax entry
    TaxEntry.objects.create(
        user=ato,
        pos_terminal=terminal,
        area_office=ato.area_office,
        tax_item=tax_item,
        taxpayer_name=taxpayer_name,
        date_of_remittance=payment_dt.date(),
        month=payment_dt.month,
        year=payment_dt.year,
        gokollect=reference,
        gokollect_amount=amount,
        source="POS",
        data=request.data
    )

    return Response({
        "status": "success",
        "mapped_to": ato.username,
        "collector_code": collector_code
    })
    

class AnalyticsSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
      try:
        if request.user.role not in ["admin", "director", "auditor", "assistant"]:
                return Response(
                    {"error": "You do not have permission to view analytics"},
                    status=status.HTTP_403_FORBIDDEN
                )
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        now = timezone.now()

        # Base queryset
        queryset = TaxEntry.objects.all()

        # Date range filter (preferred)
        if from_date and to_date:
            current_entries = queryset.filter(
                date_of_remittance__range=[from_date, to_date]
            )

            yearly_entries = current_entries

        else:
            # Default current month
            current_entries = queryset.filter(
                month=now.month,
                year=now.year
            )

            # Default current year for trend
            yearly_entries = queryset.filter(
                year=now.year
            )

        # TOTALS
        totals = current_entries.aggregate(
            remita=Coalesce(
                Sum("remita_amount"),
                Value(0, output_field=DecimalField()), output_field=DecimalField()),

            interswitch=Coalesce(
                Sum("interswitch_amount"),
                Value(0, output_field=DecimalField()), output_field=DecimalField()),

            gokollect=Coalesce(
                Sum("gokollect_amount"),
                Value(0, output_field=DecimalField()), output_field=DecimalField()),
        )

        print(
            "REMITA:",
            current_entries.filter(
                softnet_data__birsPaymentChannel="REMITA"
            ).aggregate(
                total=Sum("total_amount")
            )
        )

        print(
            "INTERSWITCH:",
            current_entries.filter(
                softnet_data__birsPaymentChannel="INTERSWITCH_PAYDIRECT"
            ).aggregate(
                total=Sum("interswitch_amount")
            )
        )

        print(
            "GOKOLLECT:",
            current_entries.aggregate(
                total=Sum("gokollect_amount")
            )
        )

        grand_total = float(totals["remita"] + totals["interswitch"] + totals["gokollect"])

        # MONTHLY TREND (optimized: single grouped query)
        trend = []

        monthly_data = (
            yearly_entries
            .values("year", "month")
            .annotate(
                remita=Coalesce(
                    Sum("remita_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField()),
                interswitch=Coalesce(
                    Sum("interswitch_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField()),
                gokollect=Coalesce(
                    Sum("gokollect_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField())
            )
            .order_by("month")
        )

        if from_date and to_date:

            monthly_map = {
                (row["year"], row["month"]): float(
                    row["remita"] +
                    row["interswitch"] +
                    row["gokollect"]
                )
                for row in monthly_data
            }

        else:

            monthly_map = {
                row["month"]: float(
                    row["remita"] +
                    row["interswitch"] +
                    row["gokollect"]
                )
                for row in monthly_data
            }

        if from_date and to_date:
            for (year, month_num), amount in sorted(monthly_map.items()):
                trend.append({
                    "month": f"{calendar.month_abbr[month_num]} {year}" if month_num else "N/A",
                    "amount": amount
                })
        else:
            for m in range(1, 13):
                trend.append({
                    "month": calendar.month_abbr[m],
                    "amount": monthly_map.get(m, 0)
                })


        # ATO PERFORMANCE (optimized: grouped query)
        ato_totals = (
            current_entries
            .values("user")
            .annotate(
                remita=Coalesce(
                    Sum("remita_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField()),
                interswitch=Coalesce(
                    Sum("interswitch_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField()),
               
                gokollect=Coalesce(
                    Sum("gokollect_amount"),
                    Value(0, output_field=DecimalField()), output_field=DecimalField()),
                )
            
        )

        ato_totals_map = {
            row["user"]: float(
                row["remita"] +
                row["interswitch"] +
                row["gokollect"]
            )
            for row in ato_totals
        }

        atos = CustomUser.objects.filter(role="ato")

        target_queryset = PerformanceTarget.objects.filter(user__role="ato")

        if not from_date:
            target_queryset = target_queryset.filter(
                month=now.month,
                year=now.year
            )

        target_map = {
            target.user_id: float(target.target_amount)
            for target in target_queryset
        }

        performance = []

        for ato in atos:
            total = ato_totals_map.get(ato.id, 0)
            target = target_map.get(ato.id, 0)

            percent = (total / target * 100) if target > 0 else 0
            percent = min(percent, 100)

            performance.append({
                "name": getattr(ato, "full_name", ato.username),
                "percent": round(percent, 1),
                "amount": total
            })

        ranked = sorted(
            performance,
            key=lambda x: x["amount"],
            reverse=True
        )

        top_performers = ranked[:5]
        bottom_performers = ranked[-5:] if len(ranked) >= 5 else ranked

        avg_percent = (
            sum([p["percent"] for p in performance]) / len(performance)
            if performance else 0
        )

        avg_percent = min(avg_percent, 100)

        return Response({
            "total_remita": float(totals["remita"]),
            "total_interswitch": float(totals["interswitch"]),
            "total_gokollect": float(totals["gokollect"]),
            "grand_total": grand_total,
            "monthly_trend": trend,
            "ato_performance": performance,
            "top_performers": top_performers,
            "bottom_performers": bottom_performers,
            "avg_percent": round(avg_percent, 1),
        })
      except Exception as e:
        print(f"🔥 ANALYTICS SUMMARY ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=500
        )


class ATOItemBreakdownView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, ato_id):
        # Groups the sum of revenue by tax_item for a specific ATO
        data = (
            TaxEntry.objects
            .filter(user_id=ato_id)
            .values("tax_item")
            .annotate(
                remita=Coalesce(
                    Sum("remita_amount"),
                    Value(0, output_field=DecimalField())
                ),
                interswitch=Coalesce(
                    Sum("interswitch_amount"),
                    Value(0, output_field=DecimalField())
                ),
                gokollect=Coalesce(
                    Sum("gokollect_amount"),
                    Value(0, output_field=DecimalField())
                ),
            )
        )
        
        return Response(data)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tax_item_aggregate(request):
    try:
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")
        now = timezone.now()

        if from_date and to_date:
            base_qs = TaxEntry.objects.filter(
                date_of_remittance__range=[from_date, to_date]
            )
        else:
            base_qs = TaxEntry.objects.filter(
                date_of_remittance__month=now.month,
                date_of_remittance__year=now.year,
            )

        amount_expr = (
            Coalesce(Sum("remita_amount"), Value(0, output_field=DecimalField()), output_field=DecimalField()) +
            Coalesce(Sum("interswitch_amount"), Value(0, output_field=DecimalField()), output_field=DecimalField()) +
            Coalesce(Sum("gokollect_amount"), Value(0, output_field=DecimalField()), output_field=DecimalField())
        )

        # Non-GoKollect: group by tax_item
        non_gokollect = (
            base_qs
            .exclude(external_source="gokollect")
            .values("tax_item")
            .annotate(total=amount_expr)
            .order_by("-total")
        )

        # GoKollect: group by area_office
        gokollect = (
            base_qs
            .filter(external_source="gokollect")
            .values("area_office")
            .annotate(total=amount_expr)
            .order_by("-total")
        )

        result = []

        for item in non_gokollect:
            total = float(item["total"] or 0)
            if total > 0:
                result.append({
                    "tax_item": item["tax_item"] or "Unknown",
                    "total": total,
                })

        for item in gokollect:
            total = float(item["total"] or 0)
            if total > 0:
                result.append({
                    "tax_item": item["area_office"] or "GoKollect Unit",
                    "total": total,
                })

        result = sorted(result, key=lambda x: x["total"], reverse=True)

        return Response(result)

    except Exception as e:
        print(f"🔥 TAX AGGREGATE ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response([], status=200)


class UserTaxEntriesView(generics.ListAPIView):
    """Get current authenticated user's tax entries."""
    serializer_class = TaxEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TaxEntry.objects.filter(user=self.request.user).order_by('-date_of_remittance')


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lookup_payment_reference(request):
    reference = request.GET.get("reference", "").strip()
    if not reference:
        return Response({"error": "Reference is required"}, status=400)

    # Check duplicate before even calling Softnet
    if TaxEntry.objects.filter(remita=reference).exists():
        return Response(
            {"error": "This Remita reference has already been submitted by your office."},
            status=400
        )
    if TaxEntry.objects.filter(interswitch_ref=reference).exists():
        return Response(
            {"error": "This Interswitch reference has already been submitted by your office."},
            status=400
        )
    if TaxEntry.objects.filter(softnet_reference=reference).exists():
        return Response(
            {"error": "This payment reference has already been recorded via the POS terminal sync. No need to submit it manually."},
            status=400
        )

    import requests as http_requests
    url = f"{settings.SOFTNET_BASE_URL}/ato/by-payment-reference/{reference}"
    headers = {"X-Client-Id": settings.SOFTNET_CLIENT_ID}

    try:
        resp = http_requests.get(url, headers=headers, timeout=15)

        if resp.status_code == 404:
            return Response(
                {"error": "Reference not found. Please check the number and try again."},
                status=404
            )

        if resp.status_code != 200:
            return Response(
                {"error": f"Payment gateway returned an error. Please try again later."},
                status=502
            )

        data = resp.json().get("data", {})

        return Response({
            "found": True,
            "taxpayer_name": data.get("customerName") or "Unknown",
            "amount": float(data.get("amount") or 0),
            "service_name": data.get("serviceName") or data.get("itemCode") or "",
            "payment_channel": (data.get("birsPaymentChannel") or "").upper(),
            "date": None,  # Softnet by-reference doesn't return date reliably
            "raw": data,
        })

    except Exception as e:
        logger.exception(f"Softnet lookup failed for reference {reference}: {str(e)}")
        return Response(
            {"error": "Could not reach the payment gateway. Please try again."},
            status=503
        )

from django.http import JsonResponse

def ssl_debug(request):
    return JsonResponse({
        "is_secure": request.is_secure(),
        "scheme": request.scheme,
        "META_X_FORWARDED_PROTO":
            request.META.get("HTTP_X_FORWARDED_PROTO"),
        "META_HOST":
            request.META.get("HTTP_HOST"),
    })
