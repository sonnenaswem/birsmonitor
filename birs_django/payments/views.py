from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Payment
from .serializers import PaymentSerializer
from .utils import verify_payment_reference


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_payment(request):
    user = request.user
    reference = request.data.get("reference")

    if not reference:
        return Response({"error": "Reference is required"}, status=400)

    # 🔒 Prevent duplicate
    if Payment.objects.filter(reference=reference).exists():
        return Response(
            {"error": "This payment has already been submitted"},
            status=400,
        )

    # 🔍 Verify payment
    verification = verify_payment_reference(reference)

    if not verification:
        return Response(
            {"error": "Invalid payment reference"},
            status=400,
        )

    # ✅ Save payment
    payment = Payment.objects.create(
        user=user,
        reference=reference,
        amount=verification["amount"],
        payer_name=verification["payer_name"],
        payment_date=verification["payment_date"],
        status="verified",
    )

    return Response(PaymentSerializer(payment).data)


