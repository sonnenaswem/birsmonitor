from tax.services.softnet_service import SoftnetService

payload = SoftnetService.get_all_terminals()

grand_total = 0

for terminal in payload["data"]:

    terminal_id = terminal["terminalId"]

    page = SoftnetService.get_transactions_by_terminal(
        terminal_id,
        page=0,
        size=1,
    )

    total = page["data"]["totalElements"]

    print(
        terminal_id,
        total
    )

    grand_total += total

print()
print("GRAND TOTAL =", grand_total)
