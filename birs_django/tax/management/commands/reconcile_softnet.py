from django.core.management.base import BaseCommand

from tax.models import TaxEntry
from tax.services import ReconciliationService



class Command(BaseCommand):

    help = "Reconcile TaxEntry records with Softnet"

    def handle(self, *args, **kwargs):

        entries = TaxEntry.objects.filter(
            reconciliation_status="pending"
        ).order_by("created_at")[:100]

        for entry in entries:
            try:
                ReconciliationService.reconcile_tax_entry(entry)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Reconciled {entry.id}"
                    )
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed {entry.id}: {str(e)}"
                    )
                )