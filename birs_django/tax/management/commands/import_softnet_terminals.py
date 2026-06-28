import pandas as pd

from django.core.management.base import BaseCommand

from tax.models import PosTerminal
from users.models import CustomUser


class Command(BaseCommand):
    help = "Import Softnet terminals from Excel"


    def add_arguments(self, parser):
        parser.add_argument(
            "excel_file",
            type=str,
        )


    def handle(self, *args, **options):

        df = pd.read_excel(options["excel_file"])

        created = 0
        updated = 0
        skipped = 0

        for _, row in df.iterrows():
            terminal_id = str(row["Terminal ID"]).strip()
            ATO_ALIASES = {
                "ATO K-ALA": "ATO KATSINA ALA",
            }

            ato_name = str(
                row.get("Suggested ATO", "")
            ).strip().upper()

            ato_name = ATO_ALIASES.get(
                ato_name,
                ato_name,
            )

            ato = CustomUser.objects.filter(
                area_office__iexact=ato_name
            ).first()

            if not ato:
                self.stdout.write(
                    self.style.WARNING(f"No ATO found for {ato_name}")
                )
                skipped += 1
                continue

            terminal, created_flag = PosTerminal.objects.get_or_create(
                terminal_id=terminal_id,
                defaults={"ato": ato},
            )

            if created_flag:
                created += 1
            else:
                terminal.ato = ato
                terminal.save()
                updated += 1


        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Created : {created}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Updated : {updated}"
            )
        )
        self.stdout.write(
            self.style.WARNING(
                f"Skipped : {skipped}"
            )
        )