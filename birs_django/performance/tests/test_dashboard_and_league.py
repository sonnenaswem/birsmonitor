from datetime import date, datetime, timezone as datetime_timezone
from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from performance.models import PerformanceTarget
from tax.models import TaxEntry
from users.models import CustomUser


class PerformanceDashboardAndLeagueTests(APITestCase):
    def setUp(self):
        cache.clear()

        self.admin_user = CustomUser.objects.create_user(
            username="admin-user",
            password="password",
            role="admin",
            area_office="Headquarters",
        )
        self.ato_one = CustomUser.objects.create_user(
            username="ato-one",
            password="password",
            role="ato",
            area_office="ATO One",
        )
        self.ato_two = CustomUser.objects.create_user(
            username="ato-two",
            password="password",
            role="ato",
            area_office="ATO Two",
        )

        PerformanceTarget.objects.create(
            user=self.ato_one,
            month=7,
            year=2026,
            target_amount=Decimal("1000.00"),
        )
        PerformanceTarget.objects.create(
            user=self.ato_two,
            month=7,
            year=2026,
            target_amount=Decimal("1000.00"),
        )
        PerformanceTarget.objects.create(
            user=self.ato_one,
            month=6,
            year=2026,
            target_amount=Decimal("500.00"),
        )

        self.client.force_authenticate(user=self.admin_user)

    def tearDown(self):
        cache.clear()

    def _july_first_now(self):
        return datetime(
            2026,
            7,
            1,
            12,
            0,
            0,
            tzinfo=datetime_timezone.utc,
        )

    def _create_entry(
        self,
        *,
        user,
        remittance_date,
        remita="0.00",
        interswitch="0.00",
        gokollect="0.00",
        area_office=None,
    ):
        return TaxEntry.objects.create(
            user=user,
            area_office=area_office or user.area_office,
            tax_item="Road Tax",
            subhead="Road Tax",
            taxpayer_name="Test Taxpayer",
            date_of_remittance=remittance_date,
            month=remittance_date.month,
            year=remittance_date.year,
            remita_amount=Decimal(remita),
            interswitch_amount=Decimal(interswitch),
            gokollect_amount=Decimal(gokollect),
            source="POS",
        )

    def _dashboard(self, params=None):
        with patch(
            "performance.views.timezone.now",
            return_value=self._july_first_now(),
        ):
            return self.client.get(
                reverse("admin-dashboard"),
                params or {},
                secure=True,
            )

    def _league_table(self, params=None):
        with patch(
            "performance.views.timezone.now",
            return_value=self._july_first_now(),
        ):
            return self.client.get(
                reverse("league-table"),
                params or {},
                secure=True,
            )

    def test_admin_dashboard_defaults_to_real_current_calendar_month(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 15),
            remita="100.00",
        )
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 6, 30),
            remita="900.00",
        )

        response = self._dashboard()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["kpis"]["grand_total"], 100.0)
        self.assertEqual(response.data["kpis"]["remita_total"], 100.0)

    def test_admin_dashboard_includes_july_first_data_on_first_day_of_month(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="125.00",
        )

        response = self._dashboard()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["kpis"]["grand_total"], 125.0)
        self.assertEqual(response.data["source_breakdown"]["pos"], 125.0)

    def test_admin_dashboard_date_range_overrides_current_month_default(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="100.00",
        )
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 6, 15),
            remita="250.00",
        )

        response = self._dashboard(
            {
                "from_date": "2026-06-01",
                "to_date": "2026-06-30",
            }
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["kpis"]["grand_total"], 250.0)
        self.assertEqual(response.data["kpis"]["remita_total"], 250.0)

    def test_admin_dashboard_single_date_filter_returns_400(self):
        response = self._dashboard({"from_date": "2026-07-01"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_dashboard_invalid_date_range_returns_400(self):
        response = self._dashboard(
            {
                "from_date": "2026-07-31",
                "to_date": "2026-07-01",
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_dashboard_revenue_totals_include_all_channels(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="100.00",
            interswitch="200.00",
            gokollect="300.00",
        )

        response = self._dashboard()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["kpis"]["remita_total"], 100.0)
        self.assertEqual(response.data["kpis"]["interswitch_total"], 200.0)
        self.assertEqual(response.data["kpis"]["gokollect_total"], 300.0)
        self.assertEqual(response.data["kpis"]["grand_total"], 600.0)

    def test_admin_dashboard_ato_aggregation_groups_by_taxentry_user_id(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="100.00",
            area_office="Shared Office Label",
        )
        self._create_entry(
            user=self.ato_two,
            remittance_date=date(2026, 7, 1),
            remita="300.00",
            area_office="Shared Office Label",
        )

        response = self._dashboard()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        by_id = {
            officer["id"]: officer
            for officer in response.data["all_officers"]
        }
        self.assertEqual(by_id[self.ato_one.id]["total"], 100.0)
        self.assertEqual(by_id[self.ato_two.id]["total"], 300.0)

    def test_league_table_reports_revenue_separately_for_two_ato_users(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="120.00",
            interswitch="30.00",
        )
        self._create_entry(
            user=self.ato_two,
            remittance_date=date(2026, 7, 1),
            gokollect="450.00",
        )

        response = self._league_table()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        by_user_id = {
            row["user_id"]: row
            for row in response.data
        }
        self.assertEqual(by_user_id[self.ato_one.id]["total"], 150.0)
        self.assertEqual(by_user_id[self.ato_two.id]["total"], 450.0)
        self.assertEqual(by_user_id[self.ato_one.id]["remita"], 120.0)
        self.assertEqual(by_user_id[self.ato_two.id]["gokollect"], 450.0)

    def test_league_table_cache_is_isolated_between_requests_in_tests(self):
        self._create_entry(
            user=self.ato_one,
            remittance_date=date(2026, 7, 1),
            remita="100.00",
        )

        first_response = self._league_table()
        self.assertEqual(first_response.status_code, status.HTTP_200_OK)

        cache.clear()

        self._create_entry(
            user=self.ato_two,
            remittance_date=date(2026, 7, 1),
            remita="200.00",
        )

        second_response = self._league_table()

        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        by_user_id = {
            row["user_id"]: row
            for row in second_response.data
        }
        self.assertEqual(by_user_id[self.ato_one.id]["total"], 100.0)
        self.assertEqual(by_user_id[self.ato_two.id]["total"], 200.0)

    def test_admin_dashboard_requires_authenticated_oversight_role(self):
        self.client.force_authenticate(user=self.ato_one)

        response = self._dashboard()

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
