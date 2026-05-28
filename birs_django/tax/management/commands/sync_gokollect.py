from django.core.management.base import BaseCommand
from tax.services.sync_service import (
    sync_gokollect_transactions
)


class Command(BaseCommand):
    help = "Sync GoKollect transactions"

    def add_arguments(self, parser):
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='Number of pages to fetch (default: 1)'
        )

    def handle(self, *args, **options):
        limit_pages = options['pages']
        self.stdout.write(self.style.NOTICE(f"Starting GoKollect sync for {limit_pages} pages..."))
        sync_gokollect_transactions(limit_pages=limit_pages)
        self.stdout.write(self.style.SUCCESS("GoKollect sync complete."))