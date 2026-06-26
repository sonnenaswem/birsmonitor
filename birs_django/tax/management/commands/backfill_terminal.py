from django.core.management.base import BaseCommand

from tax.models import PosTerminal
from tax.services.softnet_service import SoftnetService
from tax.services.reconciliation_service import (
    process_softnet_transaction,
)


class Command(BaseCommand):

    help = "Backfill Softnet transactions"

    def add_arguments(self, parser):

        parser.add_argument(
            "--terminal",
            type=str,
            help="Single terminal ID",
        )

        parser.add_argument(
            "--all-mapped",
            action="store_true",
            help="Backfill every mapped terminal",
        )

    def handle(self, *args, **options):

        terminals = []

        if options["terminal"]:

            terminals.append(
                options["terminal"]
            )

        elif options["all_mapped"]:

            terminals = list(

                PosTerminal.objects.values_list(
                    "terminal_id",
                    flat=True,
                )

            )

        else:

            self.stdout.write(
                self.style.ERROR(
                    "Specify --terminal or --all-mapped"
                )
            )

            return

        grand_total = 0

        for terminal in terminals:

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n========== {terminal} =========="
                )
            )

            page = 0
            terminal_total = 0

            while True:

                payload = (
                    SoftnetService.get_transactions_by_terminal(
                        terminal_id=terminal,
                        page=page,
                        size=100,
                    )
                )

                data = payload.get("data", {})

                content = data.get(
                    "content",
                    []
                )

                if not content:
                    break

                for txn in content:

                    process_softnet_transaction(txn)

                    terminal_total += 1
                    grand_total += 1

                total_pages = data.get(
                    "totalPages",
                    1,
                )

                self.stdout.write(

                    f"Page {page+1}/{total_pages} "
                    f"({len(content)} txns)"

                )

                page += 1

                if page >= total_pages:
                    break

            self.stdout.write(

                self.style.SUCCESS(

                    f"{terminal}: "
                    f"{terminal_total} processed"

                )

            )

        self.stdout.write(

            self.style.SUCCESS(

                f"\nDONE "
                f"({grand_total} transactions processed)"

            )

        )