from datetime import datetime

from tax.models import TaxEntry
from tax.services.softnet_service import SoftnetService


updated = 0

terminals_seen = set()

entries = TaxEntry.objects.filter(
    external_source="softnet",
    date_of_remittance__isnull=True,
)

for entry in entries:

    terminal_id = (
        entry.softnet_data.get("terminalId")
        if entry.softnet_data
        else None
    )

    if not terminal_id:
        continue

    if terminal_id in terminals_seen:
        continue

    terminals_seen.add(terminal_id)

    print(f"Processing {terminal_id}")

    page = 0

    while True:

        payload = SoftnetService.get_transactions_by_terminal(
            terminal_id,
            page=page,
            size=100,
        )

        data = payload.get("data", {})
        txns = data.get("content", [])

        if not txns:
            break

        for txn in txns:

            reference = txn.get(
                "paymentReference"
            )

            created_date = txn.get(
                "createdDate"
            )

            if not (
                reference and
                created_date
            ):
                continue

            try:

                dt = datetime.fromisoformat(
                    created_date
                ).date()

                obj = TaxEntry.objects.filter(
                    softnet_reference=reference
                ).first()

                if not obj:
                    continue

                if obj.date_of_remittance:
                    continue

                obj.date_of_remittance = dt
                obj.month = dt.month
                obj.year = dt.year

                obj.save(
                    update_fields=[
                        "date_of_remittance",
                        "month",
                        "year",
                    ]
                )

                updated += 1

            except Exception as e:

                print(
                    reference,
                    str(e)
                )

        page += 1

        total_pages = data.get(
            "totalPages",
            1
        )

        if page >= total_pages:
            break

print(
    f"UPDATED {updated} RECORDS"
)
