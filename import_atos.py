import pandas as pd
from datetime import datetime
from users.models import CustomUser
from performance.models import PerformanceTarget


def run():
    file_path = r"C:\Users\user\Desktop\BIRS\birs_django\birsatolist.xlsx"
    df = pd.read_excel(file_path)

    now = datetime.now()

    for _, row in df.iterrows():
        full_name_parts = str(row["full_name"]).strip().split(" ", 1)

        first_name = full_name_parts[0]
        last_name = full_name_parts[1] if len(full_name_parts) > 1 else ""

        username = str(row["username"]).strip()

        if CustomUser.objects.filter(username=username).exists():
            print(f"Skipping duplicate username: {username}")
            continue

        user = CustomUser.objects.create_user(
            username=username,
            password=str(row["password"]),
            role="ato",
            first_name=first_name,
            last_name=last_name,
            area_office=row["area_office"],
            gokollect_code=(
                str(row["gokollect_code"]).strip()
                if pd.notna(row["gokollect_code"])
                else None
            )
        )

        PerformanceTarget.objects.create(
            user=user,
            target_amount=row["target"],
            month=now.month,
            year=now.year
        )

    print("ATO import completed successfully")