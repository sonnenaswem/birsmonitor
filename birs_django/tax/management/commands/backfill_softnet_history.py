from django.core.management.base import BaseCommand

from tax.services.softnet_service import (
    SoftnetService,
)
from tax.services.reconciliation_service import (
    process_softnet_transaction,
)


class Command(BaseCommand):

    help = "Backfill complete Softnet history"

    def handle(self, *args, **kwargs):

        terminals_payload = (
            SoftnetService.get_all_terminals()
        )

        terminals = terminals_payload.get(
            "data",
            []
        )

        total_transactions = 0

        for terminal in terminals:

            terminal_id = terminal.get("terminalId")

            if not terminal_id:
                continue

            self.stdout.write("")
            self.stdout.write(
                f"===== {terminal_id} ====="
            )

            page = 0

            while True:

                payload = (
                    SoftnetService.get_transactions_by_terminal(
                        terminal_id=terminal_id,
                        page=page,
                        size=100,
                    )
                )

                data = payload.get(
                    "data",
                    {}
                )

                transactions = data.get(
                    "content",
                    []
                )

                if not transactions:
                    break

                for txn in transactions:

                    process_softnet_transaction(txn)

                    total_transactions += 1

                total_pages = data.get(
                    "totalPages",
                    1,
                )

                self.stdout.write(
                    f"Page {page + 1}/{total_pages} "
                    f"({len(transactions)} transactions)"
                )

                page += 1

                if page >= total_pages:
                    break

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {total_transactions} transactions"
            )
        )