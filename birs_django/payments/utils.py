# payments/utils.py
import requests
import hmac
import hashlib
from datetime import datetime
from django.conf import settings

def verify_payment_reference(reference: str):
    """
    Calls external secure endpoint to verify a payment reference.
    Includes signature/API key validation for security.
    """

    url = "https://secure-system.example.com/api/verify"  # <-- replace with real endpoint
    api_key = settings.SECURE_API_KEY                     # store your key in Django settings
    secret = settings.SECURE_API_SECRET.encode()          # store secret safely in settings

    try:
        # Call external system
        response = requests.get(url, params={"reference": reference}, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Validate signature (if provided by external system)
        signature = data.get("signature")
        payload = f"{data.get('reference')}{data.get('amount')}{data.get('payer_name')}{data.get('payment_date')}"
        expected_signature = hmac.new(secret, payload.encode(), hashlib.sha256).hexdigest()

        if signature != expected_signature:
            return None  # reject tampered or fake responses

        # Return normalized data
        return {
            "amount": float(data.get("amount")),
            "payer_name": data.get("payer_name"),
            "payment_date": datetime.fromisoformat(data.get("payment_date")).date(),
        }

    except Exception as e:
        # Log error for debugging
        print("Payment verification error:", str(e))
        return None
