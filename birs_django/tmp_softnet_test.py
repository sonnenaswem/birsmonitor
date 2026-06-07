import requests
from django.conf import settings

headers = {
    "X-Client-Id": settings.SOFTNET_CLIENT_ID,
    "Accept": "application/json",
}

base = (
    "https://service-gateway.bsg.com.ng"
    "/api/transaction-module"
)

tests = [
    f"{base}/ato/by-payment-reference/311452949778",
    f"{base}/ato/by-payment-reference/140944347070",
    f"{base}/ato/by-payment-reference/261ba005-f8d9-4ccd-9a6d-d72591c091c0",
]

for url in tests:
    print("\n" + "=" * 80)
    print(url)

    r = requests.get(
        url,
        headers=headers,
        timeout=60,
    )

    print("STATUS:", r.status_code)
    print("BODY:", r.text[:2000])
