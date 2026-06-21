import re
from decimal import Decimal

from django.db import IntegrityError

from tax.models import TaxEntry, PosTerminal
from users.models import CustomUser


def process_softnet_transaction(payload):

    payment_reference = payload.get("paymentReference")

    if not payment_reference:
        return

    amount = Decimal(
        str(payload.get("amount") or 0)
    )

    terminal_id = payload.get("terminalId")

    ato_name = payload.get("ato")

    customer_name = payload.get("customerName") or "Unknown"

    from datetime import datetime

    payment_date_raw = (
        payload.get("transactionDate")
        or payload.get("createdDate")
        or payload.get("createdAt")
        or payload.get("createdDate")
    )

    payment_date = None

    from django.utils import timezone

    now = timezone.now()

    month = now.month
    year = now.year

    if payment_date_raw:

        try:

            payment_date = datetime.fromisoformat(
                payment_date_raw.replace("Z", "+00:00")
            ).date()

            month = payment_date.month
            year = payment_date.year

        except Exception:
            pass

    service_name = payload.get("serviceName") or "POS Revenue"
    raw_payment_channel = (
        payload.get("birsPaymentChannel")
        or payload.get("paymentChannel")
        or ""
    )
    payment_channel = re.sub(r"[\s\-_]+", "", str(raw_payment_channel).strip()).upper()

    print("=" * 80)
    print("SOFTNET DEBUG")
    print("REFERENCE:", payment_reference)
    print("RAW CHANNEL:", raw_payment_channel)
    print("NORMALIZED CHANNEL:", payment_channel)
    print("AMOUNT:", amount)
    print("=" * 80)
    existing = TaxEntry.objects.filter(
        softnet_reference=payment_reference
    ).first()

    if existing:

        if not existing.date_of_remittance:

            raw_date = (
                payload.get("transactionDate")
                or payload.get("createdDate")
                or payload.get("createdAt")
            )

            if raw_date:

                try:

                    existing.date_of_remittance = (
                        datetime.fromisoformat(
                            raw_date.replace("Z", "+00:00")
                        ).date()
                    )

                    existing.data = payload
                    existing.softnet_data = payload

                    existing.save(
                        update_fields=[
                            "date_of_remittance",
                            "data",
                            "softnet_data",
                        ]
                    )

                except Exception:
                    pass

        return existing

    ato = None
    terminal = None

    if terminal_id:

        terminal = PosTerminal.objects.filter(
            terminal_id__iexact=terminal_id
        ).first()

    if terminal:

        ato = terminal.ato

    elif ato_name:

        ato = CustomUser.objects.filter(
            area_office__iexact=ato_name
        ).first()

    try:

        entry = TaxEntry.objects.create(
            user=ato,
            pos_terminal=terminal,
            area_office=ato.area_office if ato else ato_name,
            tax_item=service_name,
            subhead=service_name,
            taxpayer_name=customer_name,
            gross_amount=amount,

            remita_amount=(
                amount
                if "REMITA" in payment_channel
                else Decimal("0.00")
            ),

            interswitch_amount=(
                amount
                if "INTERSWITCH" in payment_channel
                else Decimal("0.00")
            ),
            softnet_reference=payment_reference,
            softnet_verified=True,
            softnet_status="verified",
            reconciliation_status=(
                "matched" if terminal else "pending"
            ),
            reconciliation_notes=(
                None if terminal
                else f"Terminal not mapped: {terminal_id}"
            ),
            source="POS",
            external_source="softnet",
            softnet_data=payload,
            date_of_remittance=payment_date,
            month=month,
            year=year,
            data=payload,
            payment_status="successful",
           
        )

        return entry

    except IntegrityError:
        return None
