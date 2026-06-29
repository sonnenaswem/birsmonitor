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

        ALIASES = {
            "2070WXBG": "2076DIG6",
            "2070WXBJ": "2070WTUX",
            "2070WXBK": "2070WTVA",
            "2070WXBM": "2070WTUU",
            "2070WXBQ": "2076DIF4",
            "2070WXBR": "2076DIF5",
            "2070WXBU": "2070WTUV",
            "2070WXBS": "2070WTUY",
            "2070WXBT": "2070WTUZ",
            "2070WXBY": "2076DIG6",
        }

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

            original_terminal = terminal

            terminal = ALIASES.get(
                terminal,
                terminal
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n========== {original_terminal} ({terminal}) =========="
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

                    f"{original_terminal} ({terminal}): "
                    f"{terminal_total} processed"

                )

            )

        self.stdout.write(

            self.style.SUCCESS(

                f"\nDONE "
                f"({grand_total} transactions processed)"

            )

        )