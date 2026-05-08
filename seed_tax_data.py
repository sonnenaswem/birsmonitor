import random
from decimal import Decimal
from datetime import date, timedelta
import uuid
from users.models import CustomUser
from tax.models import TaxEntry


TAX_ITEMS = [
    "PAYE",
    "Withholding Tax",
    "Direct Assessment",
    "Penalty",
    "Road Tax",
    "Business Premises",
    "Development Levy",
]

SUBHEADS = [
    "State Revenue",
    "Local Revenue",
    "Health Revenue",
    "Education Revenue",
]

SOURCES = ["Manual", "POS"]


def random_amount():
    return Decimal(random.randint(15000, 800000))


def random_reference(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"


def run():
    atos = CustomUser.objects.filter(role="ato")

    if not atos.exists():
        print("No ATO accounts found")
        return

    created = 0
    today = date.today()

    for ato in atos:
        for month_back in range(4):
            base_date = today - timedelta(days=30 * month_back)

            entries_count = random.randint(8, 25)

            for _ in range(entries_count):
                source = random.choice(SOURCES)
                amount = random_amount()

                remita_ref = None
                interswitch_ref = None
                gokollect_ref = None

                remita_amount = Decimal("0")
                interswitch_amount = Decimal("0")
                gokollect_amount = Decimal("0")

                if source == "Manual":
                    channel = random.choice(["remita", "interswitch"])

                    if channel == "remita":
                        remita_ref = random_reference("RM")
                        remita_amount = amount
                    else:
                        interswitch_ref = random_reference("IS")
                        interswitch_amount = amount

                else:
                    if ato.gokollect_code:
                        gokollect_ref = random_reference("GH")
                        gokollect_amount = amount
                    else:
                        remita_ref = random_reference("RM")
                        remita_amount = amount

                TaxEntry.objects.create(
                    user=ato,
                    area_office=ato.area_office,
                    tax_item=random.choice(TAX_ITEMS),
                    subhead=random.choice(SUBHEADS),
                    taxpayer_name=f"Taxpayer {random.randint(100,999)}",
                    date_of_remittance=base_date,
                    month=base_date.month,
                    year=base_date.year,
                    remita=remita_ref,
                    interswitch_ref=interswitch_ref,
                    gokollect=gokollect_ref,
                    remita_amount=remita_amount,
                    interswitch_amount=interswitch_amount,
                    gokollect_amount=gokollect_amount,
                    source=source,
                )

                created += 1

    print(f"{created} tax entries created successfully")