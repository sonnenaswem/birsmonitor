from openpyxl import Workbook
from django.core.management.base import BaseCommand

from tax.services.softnet_service import SoftnetService


class Command(BaseCommand):
    help = "Export Softnet terminal registry"

    def handle(self, *args, **kwargs):

        payload = SoftnetService.get_all_terminals()

        terminals = payload.get("data", [])

        wb = Workbook()
        ws = wb.active
        ws.title = "Softnet Registry"

        ws.append([
            "Terminal ID",
            "ATO",
            "Channel",
            "Status",
            "Raw Record"
        ])

        for terminal in terminals:

            ws.append([
                terminal.get("terminalId"),
                terminal.get("ato"),
                terminal.get("channelName"),
                terminal.get("status"),
                str(terminal)
            ])

        filename = "softnet_terminal_registry.xlsx"

        wb.save(filename)

        self.stdout.write(self.style.SUCCESS(
            f"Exported {len(terminals)} terminals to {filename}"
        ))