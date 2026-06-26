from django.core.management.base import BaseCommand

from tax.models import TaxEntry
from tax.models import PosTerminal


class Command(BaseCommand):

    help = "Backfill terminal mappings"


    def handle(self, *args, **kwargs):

        terminals = {
            t.terminal_id: t
            for t in PosTerminal.objects.select_related("ato")
        }

        updated = 0

        qs = (
            TaxEntry.objects
            .filter(
                external_source="softnet",
                pos_terminal__isnull=True,
            )
        )

        total = qs.count()

        self.stdout.write(
            f"Checking {total} transactions..."
        )

        for tx in qs.iterator():

            terminal = (
                tx.data or {}
            ).get("terminalId")

            if not terminal:
                continue

            pos = terminals.get(terminal)

            if not pos:
                continue

            tx.pos_terminal = pos
            tx.area_office = pos.ato.area_office
            tx.user = pos.ato

            tx.save(
                update_fields=[
                    "pos_terminal",
                    "area_office",
                    "user",
                ]
            )

            updated += 1

            if updated % 1000 == 0:
                self.stdout.write(
                    f"{updated} updated..."
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. Updated {updated}"
            )
        )