# tmp_terminal_count.py

from tax.services.softnet_service import SoftnetService

payload = SoftnetService.get_all_terminals()

print(
    "TOTAL TERMINALS:",
    len(payload["data"])
)

for terminal in payload["data"][:20]:
    print(terminal)
