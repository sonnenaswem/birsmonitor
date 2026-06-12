from django.shortcuts import render
from django.db.models import F, FloatField, ExpressionWrapper, DecimalField, Value
from django.db.models.functions import Coalesce
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework import status, permissions
from .models import CustomUser
from django.shortcuts import get_object_or_404
from django.db.models.functions import TruncDate
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import timedelta
from tax.models import TaxEntry 
from performance.models import PerformanceTarget
from rest_framework import viewsets
from django.contrib.auth.models import AbstractUser


from .serializers import OfficerAccountSerializer


class ListUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        role = request.GET.get('role')
        if role:
            users = CustomUser.objects.filter(role=role)
        else:
            users = CustomUser.objects.all()
        
        data = [
            {
                'id': user.id,
                'username': user.username,

                # Prefer explicit full_name field.
                # Fall back to first_name for older accounts.
                # Finally fall back to username.
                'full_name': (
                    getattr(user, "full_name", None)
                    or user.first_name
                    or user.username
                ),

                'email': user.email,
                'role': user.role,
                'area_office': user.area_office or ''
            }
            for user in users
        ]
        return Response(data)


    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserManagementView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        action = request.data.get('action')
        value = request.data.get('value')

        if action == "change_role":
            # Rule: ATOs are 'Fixed Stations'—their role can NEVER change.
            if user.role == "ato":
                return Response({"error": "ATO stations are permanent and cannot change roles."}, status=400)
            
            # Rule: Admin can only promote/demote between Admin, Director, and Auditor
            if value in ["admin", "director", "auditor"]:
                user.role = value
                user.save()
                return Response({"status": "Role updated"})
            
        if action == "set_target":
            new_target = request.data.get("value")
            if new_target is None:
                return Response({"error": "Target value required"}, status=400)

            PerformanceTarget.objects.update_or_create(
                user=user,
                month=timezone.now().month,
                year=timezone.now().year,
                defaults={"target_amount": new_target}
            )
            return Response({"success": True, "target": new_target})


        return Response({"error": "Invalid action"}, status=400)

    def delete(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        
        # Rule: Protect ATOs from accidental deletion
        if user.role == "ato":
            return Response({"error": "ATO stations cannot be deleted. Use 'Reassign' to change personnel."}, status=400)
        
        if user == request.user:
            return Response({"error": "You cannot delete yourself."}, status=400)
            
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReassignStationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        
        # Only ATOs should be reassigned this way
        if user.role != "ato":
            return Response({"error": "Only ATO stations can be reassigned."}, status=400)

        new_name = request.data.get('full_name')
        new_password = request.data.get('password')

        # 1. Update the identifying info
        name_parts = new_name.strip().split(" ", 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ""
        # 2. Set new password (this automatically invalidates all existing login sessions)
        user.set_password(new_password)
        # 3. Ensure they are active
        user.is_active = True
        
        user.save()
        
        return Response({"status": "Station reassigned to " + new_name})
    


class ATODetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, user_id):
        now = timezone.now()
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")
        ato = get_object_or_404(CustomUser, pk=user_id, role='ato')
        entries = TaxEntry.objects.filter(user=ato)

        total_expr = ExpressionWrapper(
            Coalesce(F('remita_amount'), Value(0)) + Coalesce(F('interswitch_amount'), Value(0)) + Coalesce(F('gokollect_amount'), Value(0)),
            output_field=DecimalField()
        )
        if from_date and to_date:
            entries = entries.filter(date_of_remittance__range=[from_date, to_date])
        else:
            entries = entries.filter(
                date_of_remittance__year=now.year,
                date_of_remittance__month=now.month
            )
    
        
        totals = entries.aggregate(
            remita_total=Sum('remita_amount'),
            interswitch_total=Sum('interswitch_amount'),
            gokollect_total=Sum('gokollect_amount'),
            grand_total=Sum(total_expr),

            pos_total=Sum(total_expr, filter=Q(source='POS')),
            manual_total=Sum(total_expr, filter=Q(source='Manual')),

            count=Count('id')
        )

        # 3. Collection trend for the selected range or last 7 days
        trend_entries = TaxEntry.objects.filter(user=ato)

        if from_date and to_date:
            trend_entries = trend_entries.filter(date_of_remittance__date__range=[from_date, to_date])
        else:
            seven_days_ago = now.date() - timedelta(days=7)
            trend_entries = trend_entries.filter(date_of_remittance__gte=seven_days_ago)

        trend_data = (
            trend_entries
            .annotate(date=TruncDate('date_of_remittance'))
            .values('date')
            .annotate(amount=Sum(total_expr))
            .order_by('date')
        )

        activity_trend = [
            {"date": item['date'].strftime('%b %d'), "amount": float(item['amount'] or 0)}
            for item in trend_data
        ]

        # 4. Highest & Recent Payments
        highest_payments = entries.annotate(total=total_expr).order_by('-total')[:3]
        recent_payments = entries.order_by('-date_of_remittance', '-id')[:10]
        last_entry_obj = recent_payments.first()
        last_entry_time = None
        if last_entry_obj and last_entry_obj.date_of_remittance:
            last_entry_time = last_entry_obj.date_of_remittance.strftime('%b %d, %Y')
        # 5. Determine Rank
        all_atos = CustomUser.objects.filter(role='ato')
        rank_list = []
        for a in all_atos:
            total = TaxEntry.objects.filter(
                user=a,
                date_of_remittance__year=now.year,
                date_of_remittance__month=now.month
            ).aggregate(s=Sum(total_expr))['s'] or 0

            rank_list.append((a.id, total))

        rank_list.sort(key=lambda x: x[1], reverse=True)

        try:
            rank = [item[0] for item in rank_list].index(ato.id) + 1
        except ValueError:
            rank = "N/A"

        # 6. Get Target Amount
        target = PerformanceTarget.objects.filter(
            user=ato,
            month=now.month,
            year=now.year
        ).first()

        target_amount = float(target.target_amount) if target else 0.0

        grand_total = float(totals['grand_total'] or 0)

        item_breakdown = (
            entries.values("tax_item")
            .annotate(total=Sum(total_expr))
            .order_by("-total")
        )

        item_breakdown_data = [
            {
                "tax_item": item["tax_item"],
                "total": float(item["total"] or 0)
            }
            for item in item_breakdown
        ]

        return Response({
            "username": ato.username,
            "full_name": getattr(ato, 'full_name', ato.first_name),
            "area_office": ato.area_office,
            "station_name": ato.area_office or ato.username,
            "target": target_amount,
            "total": grand_total,
            "pos_total": float(totals['pos_total'] or 0),
            "manual_total": float(totals['manual_total'] or 0),
            "percent": round((grand_total / target_amount * 100), 1) if target_amount > 0 else 0.0,
            "rank": rank,
            "last_entry": last_entry_time,
            "activity_trend": activity_trend,
            "highest_payments": [
                {"taxpayer": p.taxpayer_name, "amount": float((p.remita_amount or 0) + (p.interswitch_amount or 0) + (p.gokollect_amount or 0))} 
                for p in highest_payments
            ],
            
            "item_breakdown": item_breakdown_data,
            "remita_total": float(totals['remita_total'] or 0),
            "interswitch_total": float(totals['interswitch_total'] or 0),
            "gokollect_total": float(totals['gokollect_total'] or 0),
            "recent_payments": [
                {
                    "taxpayer": p.taxpayer_name, 
                    "reference": p.remita or p.interswitch_ref or p.gokollect,
                    "amount": float((p.remita_amount or 0) + (p.interswitch_amount or 0) + (p.gokollect_amount or 0)), 
                    "source": p.source, 
                    "date": p.date_of_remittance.strftime('%Y-%m-%d %H:%M:%S')
                } for p in recent_payments
            ]
        })


class OfficerAccountViewSet(viewsets.ViewSet):

    @transaction.atomic
    def create(self, request):
        data = request.data

        full_name = data.get("full_name")
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "ATO")  # default role
        email = data.get("email")
        target_raw = data.get("target")

        # ✅ Basic validation
        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Parse target safely
        try:
            target_amount = float(target_raw) if target_raw else 0
        except ValueError:
            return Response(
                {"error": "Target must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ✅ Create user
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                first_name=full_name.split(" ", 1)[0] if full_name else "",
                last_name=full_name.split(" ", 1)[1] if full_name and " " in full_name else "",
                role=role,
                password=password,
            )

            # ✅ Create or update monthly target
            now = timezone.now()
            PerformanceTarget.objects.update_or_create(
                user=user,
                month=now.month,
                year=now.year,
                defaults={"target_amount": target_amount}
            )

            return Response(
                {
                    "message": "User and target created successfully",
                    "username": username,
                },
                status=status.HTTP_201_CREATED
            )

        except IntegrityError:
            return Response(
                {"error": "Username or email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        

class SetTargetView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        return self._set_target(request)

    def patch(self, request):
        return self._set_target(request)

    def _set_target(self, request):
        user = request.data.get("user")
        month = request.data.get("month")
        year = request.data.get("year")
        target_amount = request.data.get("target_amount")

        if not all([user, month, year, target_amount]):
            return Response(
                {"error": "Missing required fields: user, month, year, target_amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_amount = float(target_amount)
        except ValueError:
            return Response(
                {"error": "target_amount must be a number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        target, created = PerformanceTarget.objects.update_or_create(
            user_id=user,
            month=month,
            year=year,
            defaults={"target_amount": target_amount}
        )

        return Response({
            "message": "Target updated" if not created else "Target created",
            "data": {
                "user": user,
                "month": month,
                "year": year,
                "target_amount": target.target_amount
            }
        })
    

class CreateAdminAccountView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        data = request.data

        try:
            full_name = data.get("full_name", "").strip()
            name_parts = full_name.split(" ", 1)

            first_name = name_parts[0] if len(name_parts) > 0 else ""
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            user = CustomUser.objects.create_user(
                username=data["username"],
                email=data.get("email", ""),
                password=data["password"],
                first_name=first_name,
                last_name=last_name,
                role=data.get("role", "admin").lower()
            )

            return Response(
                {"message": f"{user.role} account created successfully!"},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )