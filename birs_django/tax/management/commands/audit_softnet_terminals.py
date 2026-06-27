from django.core.management.base import BaseCommand

from tax.models import PosTerminal
from tax.services.softnet_service import SoftnetService
from users.models import CustomUser


class Command(BaseCommand):

    help = "Audit Softnet terminals against local mappings"

    def handle(self, *args, **options):

        payload = SoftnetService.get_all_terminals()

        terminals = payload.get("data", [])

        self.stdout.write("")
        self.stdout.write("=" * 100)
        self.stdout.write(
            f"SOFTNET TERMINALS RECEIVED: {len(terminals)}"
        )
        self.stdout.write("=" * 100)

        matched = 0
        mismatched = 0
        missing_terminal = 0
        missing_ato = 0

        for item in terminals:

            terminal_id = (
                item.get("terminalId")
                or ""
            ).strip().upper()

            softnet_ato = (
                item.get("ato")
                or ""
            ).strip()

            local_terminal = PosTerminal.objects.select_related(
                "ato"
            ).filter(
                terminal_id__iexact=terminal_id
            ).first()

            local_ato = (
                local_terminal.ato.area_office
                if local_terminal and local_terminal.ato
                else None
            )

            ato_exists = CustomUser.objects.filter(
                area_office__iexact=softnet_ato
            ).exists()

            if not local_terminal:

                missing_terminal += 1

                self.stdout.write("")
                self.stdout.write(
                    f"[MISSING TERMINAL] {terminal_id}"
                )
                self.stdout.write(
                    f"Softnet ATO : {softnet_ato}"
                )

                if not ato_exists:
                    missing_ato += 1
                    self.stdout.write(
                        "Local ATO   : DOES NOT EXIST"
                    )

                continue

            if (
                local_ato or ""
            ).strip().upper() != softnet_ato.strip().upper():

                mismatched += 1

                self.stdout.write("")
                self.stdout.write(
                    f"[MISMATCH] {terminal_id}"
                )
                self.stdout.write(
                    f"Database : {local_ato}"
                )
                self.stdout.write(
                    f"Softnet  : {softnet_ato}"
                )

            else:

                matched += 1

        self.stdout.write("")
        self.stdout.write("=" * 100)
        self.stdout.write("SUMMARY")
        self.stdout.write("=" * 100)

        self.stdout.write(
            f"Matched            : {matched}"
        )

        self.stdout.write(
            f"Mismatched         : {mismatched}"
        )

        self.stdout.write(
            f"Missing Terminals  : {missing_terminal}"
        )

        self.stdout.write(
            f"Missing ATOs       : {missing_ato}"
        )

        self.stdout.write("=" * 100)