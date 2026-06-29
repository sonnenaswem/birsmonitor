from collections import defaultdict

from django.core.management.base import BaseCommand

from tax.models import PosTerminal
from tax.models import TaxEntry
from users.models import CustomUser


class Command(BaseCommand):

    help = (
        "Automatically discover and register "
        "missing Softnet terminals."
    )

    def handle(self, *args, **kwargs):

        known = set(
            PosTerminal.objects.values_list(
                "terminal_id",
                flat=True,
            )
        )

        discovered = defaultdict(
            lambda: {
                "areas": set(),
                "count": 0,
            }
        )

        qs = TaxEntry.objects.filter(
            external_source="softnet"
        ).values(
            "area_office",
            "data",
        )

        for row in qs:

            data = row["data"] or {}

            terminal = (
                data.get("newTerminalId")
                or data.get("terminalId")
                or data.get("taxIdNumber")
            )

            if not terminal:
                continue

            terminal = terminal.strip().upper()

            if terminal in known:
                continue

            discovered[terminal]["count"] += 1

            if row["area_office"]:
                discovered[terminal]["areas"].add(
                    row["area_office"]
                )

        created = 0
        skipped = 0

        self.stdout.write("")

        for terminal, info in sorted(
            discovered.items(),
            key=lambda x: x[1]["count"],
            reverse=True,
        ):

            areas = list(info["areas"])

            if len(areas) != 1:

                self.stdout.write(
                    self.style.WARNING(
                        f"SKIPPED {terminal} "
                        f"(multiple ATOs: {areas})"
                    )
                )

                skipped += 1
                continue

            area = areas[0]

            ALIASES = {
                "ATO K-ALA": "ATO KATSINA ALA",
                "ATO UGBOKPO": "ATO UGBOKOLO",
            }

            area = ALIASES.get(area, area)

            ato = CustomUser.objects.filter(
                area_office=area
            ).first()

            if not ato:

                self.stdout.write(
                    self.style.WARNING(
                        f"NO USER FOR {area}"
                    )
                )

                skipped += 1
                continue

            PosTerminal.objects.create(
                terminal_id=terminal,
                ato=ato,
                channel="softnet",
            )

            created += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"CREATED "
                    f"{terminal} -> {area}"
                )
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created}"
            )
        )

        self.stdout.write(
            self.style.WARNING(
                f"Skipped: {skipped}"
            )
        )