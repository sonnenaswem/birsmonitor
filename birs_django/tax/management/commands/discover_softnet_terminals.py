from django.core.management.base import BaseCommand
from tax.models import PosTerminal
from tax.services.softnet_service import SoftnetService
from users.models import CustomUser


class Command(BaseCommand):

    help = "Discover terminals directly from Softnet registry"

    def handle(self, *args, **kwargs):

        payload = SoftnetService.get_all_terminals()

        terminals = payload.get("data", [])

        created = 0
        skipped = 0

        for item in terminals:

            terminal = (
                item.get("newTerminalId")
                or item.get("terminalId")
            )

            if not terminal:
                continue

            terminal = terminal.strip().upper()

            if PosTerminal.objects.filter(
                terminal_id=terminal
            ).exists():

                skipped += 1
                continue


            area = item.get("ato")

            ato = CustomUser.objects.filter(
                area_office=area
            ).first()

            if not ato:
                self.stdout.write(
                    self.style.WARNING(
                        f"NO USER FOR {terminal} -> {area}"
                    )
                )
                continue


            PosTerminal.objects.create(
                terminal_id=terminal,
                ato=ato,
                channel="softnet",
            )

            created += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"CREATED {terminal} -> {area}"
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