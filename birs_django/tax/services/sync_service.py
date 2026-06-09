import logging
import requests
from datetime import datetime
from django.conf import settings
from django.db import IntegrityError

from tax.models import TaxEntry
from users.models import CustomUser

logger = logging.getLogger(__name__)

# ONLY these collector codes are allowed for now
ALLOWED_CODES = {
    "GHSA",
    "GHA",
    "GHNA",
    "GHOI",
    "GHO",
    "GHOJ",
    "GHID",
    "GHAL",
    "GHIG",
    "GHKA",
    "GHBU",
    "GHMA",
    "GHOB",
    "GHWA",
    "GHTS",
    "GHVA",
    "GHOK",
    "GHBO",
    "GHGB",
    "GHUG",
    "GHUK",
    "BENGIS",
}


def sync_gokollect_transactions(limit_pages=1):
    """
    Pull successful transactions from Novus/GoKollect
    and create TaxEntry records.
    """

    url = settings.GOKOLLECT_BASE_URL

    headers = {
        "secret": settings.GOKOLLECT_SECRET,
        "identity": settings.GOKOLLECT_IDENTITY,
    }

    page = 1
    page_size = 100

    all_records = []

    while page <= limit_pages:
        print(f"Processing page {page}...")

        params = {
            "page": page,
            "pageSize": page_size,
        }

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=60
        )
        print(f"Page {page} status: {response.status_code}")

        if response.status_code != 200:

            logger.error(
                f"GOKOLLECT API ERROR | "
                f"Status: {response.status_code} | "
                f"Response: {response.text}"
            )

            break

        payload = response.json()

        records = payload.get("data", {}).get("list", [])
        print(f"Fetched {len(records)} records on page {page}")

        if not records:
            break

        all_records.extend(records)

        if len(records) < page_size:
            break

        page += 1

    print(f"Total records fetched: {len(all_records)}")  # <-- Debug print



    created_count = 0
    skipped_count = 0

    for record in all_records:

        payment_status = record.get("paymentStatus")

        # ONLY successful payments
        if payment_status != "successful":
            skipped_count += 1
            print(f"Skipped: tx_ref={record.get('tx_ref')} because paymentStatus={payment_status}")
        
            continue

        tx_ref = record.get("tx_ref")

        if not tx_ref:
            skipped_count += 1
            print("Skipped: missing tx_ref")
            continue


        invoice_no = record.get("invoiceNo", "")

        # Extract collector code
        
        collector_code = None

        sorted_codes = sorted(
            ALLOWED_CODES,
            key=len,
            reverse=True
        )

        for allowed_code in sorted_codes:

            if invoice_no.startswith(allowed_code):
                collector_code = allowed_code
                break

        # Ignore unrelated payments
        if not collector_code:
            skipped_count += 1
            print(f"Skipped: invoiceNo={invoice_no} not in ALLOWED_CODES")
            continue

        # Resolve ATO
        ato = CustomUser.objects.filter(
            gokollect_code=collector_code
        ).first()

        if not ato:
            skipped_count += 1
            print(f"Skipped: no ATO for collector_code={collector_code}")
            continue

        customer = record.get("customerDetails", {})

        taxpayer_name = customer.get("name") or "Unknown"

        total_amount = record.get("totalAmount") or 0

        item_details = record.get("itemDetails", {})

        tax_item = next(
            iter(item_details.keys()),
            "General Revenue"
        )

        created_at = record.get("createdAt")

        try:
            payment_date = datetime.fromisoformat(
                created_at.replace("Z", "+00:00")
            ).date()
        except Exception:
            skipped_count += 1
            print(f"Skipped: invalid createdAt={created_at}")
            continue
        
        try:

            TaxEntry.objects.create(
                user=ato,
                area_office=ato.area_office,
                tax_item=tax_item,
                subhead=tax_item,
                taxpayer_name=taxpayer_name,
                date_of_remittance=payment_date,
                month=payment_date.month,
                year=payment_date.year,
                gokollect=tx_ref,
                gokollect_amount=total_amount,
                source="POS",
                data=record,
                external_source="gokollect",
            )

            created_count += 1

        except IntegrityError:
            skipped_count += 1
            print(f"Skipped: duplicate tx_ref={tx_ref}")
            continue

    print(f"SYNC DONE | Created: {created_count} | Skipped: {skipped_count}")  # <-- Debug print

    logger.info(
        f"GOKOLLECT SYNC COMPLETE | "
        f"Created: {created_count} | "
        f"Skipped: {skipped_count}"
    )