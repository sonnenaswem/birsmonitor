from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


ATOS = [
    {
        "username": "ato_zakibiam",
        "email": "atozakibiam_ghsa@mailhost.com",
        "first_name": "ATO",
        "last_name": "ZAKIBIAM",
        "gokollect_code": "GHSA",
        "role": "ato",
        "area_office": "ATO ZAKI BIAM",
        "password": "pass123"
    },
    {
        "username": "ato_adikpo",
        "email": "atoadikpo_gha@mailhost.com",
        "first_name": "ATO",
        "last_name": "ADIKPO",
        "gokollect_code": "GHA",
        "role": "ato",
        "area_office": "ATO ADIKPO",
        "password": "pass124"
    },
    {
        "username": "ato_naka",
        "email": "atonaka_ghna@mailhost.com",
        "first_name": "ATO",
        "last_name": "NAKA",
        "gokollect_code": "GHNA",
        "role": "ato",
        "area_office": "ATO NAKA",
        "password": "pass125"
    },
    {
        "username": "ato_obi",
        "email": "atoobi_ghoi@mailhost.com",
        "first_name": "ATO",
        "last_name": "OBI",
        "gokollect_code": "GHOI",
        "role": "ato",
        "area_office": "ATO OBI",
        "password": "pass126"
    },
    {
        "username": "ato_ogbadigbo",
        "email": "atoogbadigbo_gho@mailhost.com",
        "first_name": "ATO",
        "last_name": "OGBADIGBO",
        "gokollect_code": "GHO",
        "role": "ato",
        "area_office": "ATO OGBADIGBO",
        "password": "pass127"
    },
    {
        "username": "ato_oju",
        "email": "atooju_ghoj@mailhost.com",
        "first_name": "ATO",
        "last_name": "OJU",
        "gokollect_code": "GHOJ",
        "role": "ato",
        "area_office": "ATO OJU",
        "password": "pass128"
    },
    {
        "username": "ato_ohimini",
        "email": "atoohimini_ghid@mailhost.com",
        "first_name": "ATO",
        "last_name": "OHIMINI",
        "gokollect_code": "GHID",
        "role": "ato",
        "area_office": "ATO OHIMINI",
        "password": "pass129"
    },
    {
        "username": "ato_aliade",
        "email": "atoaliade_ghal@mailhost.com",
        "first_name": "ATO",
        "last_name": "ALIADE",
        "gokollect_code": "GHAL",
        "role": "ato",
        "area_office": "ATO ALIADE",
        "password": "pass130"
    },
    {
        "username": "ato_ado",
        "email": "atoado_ghig@mailhost.com",
        "first_name": "ATO",
        "last_name": "ADO",
        "gokollect_code": "GHIG",
        "role": "ato",
        "area_office": "ATO ADO",
        "password": "pass131"
    },
    {
        "username": "ato_katsina_ala",
        "email": "atokatsinaala_ghl@mailhost.com",
        "first_name": "ATO",
        "last_name": "KATSINA ALA",
        "gokollect_code": "GHL",
        "role": "ato",
        "area_office": "ATO KATSINA ALA",
        "password": "pass132"
    },
    {
        "username": "ato_buruku",
        "email": "atoburuku_ghbu@mailhost.com",
        "first_name": "ATO",
        "last_name": "BURUKU",
        "gokollect_code": "GHBU",
        "role": "ato",
        "area_office": "ATO BURUKU",
        "password": "pass133"
    },
    {
        "username": "ato_north_bank",
        "email": "atonorthbank_ghma@mailhost.com",
        "first_name": "ATO",
        "last_name": "NORTH BANK",
        "gokollect_code": "GHMA",
        "role": "ato",
        "area_office": "ATO NORTH BANK",
        "password": "pass134"
    },
    {
        "username": "ato_agatu",
        "email": "atoagatu_ghob@mailhost.com",
        "first_name": "ATO",
        "last_name": "AGATU",
        "gokollect_code": "GHOB",
        "role": "ato",
        "area_office": "ATO AGATU",
        "password": "pass135"
    },
    {
        "username": "ato_tarka",
        "email": "atotarka_ghwa@mailhost.com",
        "first_name": "ATO",
        "last_name": "TARKA",
        "gokollect_code": "GHWA",
        "role": "ato",
        "area_office": "ATO TARKA",
        "password": "pass136"
    },
    {
        "username": "ato_konshisha",
        "email": "atokonshisha_ghts@mailhost.com",
        "first_name": "ATO",
        "last_name": "KONSHISHA",
        "gokollect_code": "GHTS",
        "role": "ato",
        "area_office": "ATO KONSHISHA",
        "password": "pass137"
    },
    {
        "username": "ato_vandeikya",
        "email": "atovandeikya_ghva@mailhost.com",
        "first_name": "ATO",
        "last_name": "VANDEIKYA",
        "gokollect_code": "GHVA",
        "role": "ato",
        "area_office": "ATO VANDEIKYA",
        "password": "pass138"
    },
    {
        "username": "ato_okpokwu",
        "email": "atookpokwu_ghok@mailhost.com",
        "first_name": "ATO",
        "last_name": "OKPOKWU",
        "gokollect_code": "GHOK",
        "role": "ato",
        "area_office": "ATO OKPOKWU",
        "password": "pass139"
    },
    {
        "username": "ato_gboko",
        "email": "atogboko_ghbo@mailhost.com",
        "first_name": "ATO",
        "last_name": "GBOKO I",
        "gokollect_code": "GHBO",
        "role": "ato",
        "area_office": "ATO GBOKO I",
        "password": "pass140"
    },
    {
        "username": "ato_guma",
        "email": "atoguma_ghgb@mailhost.com",
        "first_name": "ATO",
        "last_name": "GUMA",
        "gokollect_code": "GHGB",
        "role": "ato",
        "area_office": "ATO GUMA",
        "password": "pass141"
    },
    {
        "username": "ato_logo",
        "email": "atologo_ghug@mailhost.com",
        "first_name": "ATO",
        "last_name": "LOGO",
        "gokollect_code": "GHUG",
        "role": "ato",
        "area_office": "ATO LOGO",
        "password": "pass142"
    },
    {
        "username": "ato_apa",
        "email": "atoapa_ghuk@mailhost.com",
        "first_name": "ATO",
        "last_name": "APA",
        "gokollect_code": "GHUK",
        "role": "ato",
        "area_office": "ATO APA",
        "password": "pass143"
    },
    {
        "username": "groundrent",
        "email": "groundrent_bengis@mailhost.com",
        "first_name": "GROUND",
        "last_name": "RENT",
        "gokollect_code": "BENGIS",
        "role": "ato",
        "area_office": "GROUND RENT",
        "password": "pass144"
    },
    {
        "username": "ato_ushongo_town",
        "email": "atoushongotown@mailhost.com",
        "first_name": "ATO",
        "last_name": "USHONGO TOWN",
        "role": "ato",
        "area_office": "ATO USHONGO TOWN",
        "password": "pass145"
    },
    {
        "username": "ato_ihugh",
        "email": "atoihugh@mailhost.com",
        "first_name": "ATO",
        "last_name": "IHUGH",
        "role": "ato",
        "area_office": "ATO IHUGH",
        "password": "pass146"
    },
    {
        "username": "ato_jato_aka",
        "email": "atojatoaka@mailhost.com",
        "first_name": "ATO",
        "last_name": "JATO AKA",
        "role": "ato",
        "area_office": "ATO JATO AKA",
        "password": "pass147"
    },
    {
        "username": "ato_tor_donga",
        "email": "atotordonga@mailhost.com",
        "first_name": "ATO",
        "last_name": "TOR-DONGA",
        "role": "ato",
        "area_office": "ATO TOR-DONGA",
        "password": "pass148"
    },
    {
        "username": "ato_kyado",
        "email": "atokyado@mailhost.com",
        "first_name": "ATO",
        "last_name": "KYADO",
        "role": "ato",
        "area_office": "ATO KYADO",
        "password": "pass149"
    },
    {
        "username": "ato_lessel",
        "email": "atolessel@mailhost.com",
        "first_name": "ATO",
        "last_name": "LESSEL",
        "role": "ato",
        "area_office": "ATO LESSEL",
        "password": "pass150"
    },
    {
        "username": "ato_wadata",
        "email": "atowadata@mailhost.com",
        "first_name": "ATO",
        "last_name": "WADATA",
        "role": "ato",
        "area_office": "ATO WADATA",
        "password": "pass151"
    },
    {
        "username": "ato_centralward",
        "email": "atocentralward@mailhost.com",
        "first_name": "ATO",
        "last_name": "CENTRAL WARD",
        "role": "ato",
        "area_office": "ATO CENTRAL WARD",
        "password": "pass152"
    },
    {
        "username": "ato_wailomayo",
        "email": "atowailomayo@mailhost.com",
        "first_name": "ATO",
        "last_name": "WAILOMAYO",
        "role": "ato",
        "area_office": "ATO WAILOMAYO",
        "password": "pass153"
    },
    {
        "username": "ato_modernmarket",
        "email": "atomodernmarket@mailhost.com",
        "first_name": "ATO",
        "last_name": "MODERN MARKET",
        "role": "ato",
        "area_office": "ATO MODERN MARKET",
        "password": "pass154"
    },
    {
        "username": "ato_headquarters",
        "email": "atoheadquarters@mailhost.com",
        "first_name": "ATO",
        "last_name": "HEADQUARTERS",
        "role": "ato",
        "area_office": "ATO HEADQUARTERS",
        "password": "pass155"
    },
    {
        "username": "ato_yaikyo",
        "email": "atoyaikyo@mailhost.com",
        "first_name": "ATO",
        "last_name": "YAIKYO",
        "role": "ato",
        "area_office": "ATO YAIKYO",
        "password": "pass156"
    },
    {
        "username": "ato_terwaseagbadu",
        "email": "atoterwaseagbadu@mailhost.com",
        "first_name": "ATO",
        "last_name": "TERWASE AGBADU",
        "role": "ato",
        "area_office": "ATO TERWASE AGBADU",
        "password": "pass157"
    },
    {
        "username": "ato_tsekucha",
        "email": "atotsekucha@mailhost.com",
        "first_name": "ATO",
        "last_name": "TSE-KUCHA",
        "role": "ato",
        "area_office": "ATO TSE-KUCHA",
        "password": "pass158"
    },
    {
        "username": "ato_adekaa",
        "email": "atoadekaa@mailhost.com",
        "first_name": "ATO",
        "last_name": "ADEKAA",
        "role": "ato",
        "area_office": "ATO ADEKAA",
        "password": "pass159"
    },
    {
        "username": "ato_mkar",
        "email": "atomkar@mailhost.com",
        "first_name": "ATO",
        "last_name": "MKAR",
        "role": "ato",
        "area_office": "ATO MKAR",
        "password": "pass160"
    },
    {
        "username": "ato_tyowanye",
        "email": "atotyowanye@mailhost.com",
        "first_name": "ATO",
        "last_name": "TYOWANYE",
        "role": "ato",
        "area_office": "ATO TYOWANYE",
        "password": "pass161"
    },
    {
        "username": "ato_otukpo",
        "email": "atootukpo@mailhost.com",
        "first_name": "ATO",
        "last_name": "OTUKPO",
        "role": "ato",
        "area_office": "ATO OTUKPO",
        "password": "pass162"
    },
    {
        "username": "ato_otukpa",
        "email": "atootukpa@mailhost.com",
        "first_name": "ATO",
        "last_name": "OTUKPA",
        "role": "ato",
        "area_office": "ATO OTUKPA",
        "password": "pass163"
    },
    {
        "username": "ato_okpoga",
        "email": "atookpoga@mailhost.com",
        "first_name": "ATO",
        "last_name": "OKPOGA",
        "role": "ato",
        "area_office": "ATO OKPOGA",
        "password": "pass164"
    },
    {
        "username": "ato_adoka",
        "email": "atoadoka@mailhost.com",
        "first_name": "ATO",
        "last_name": "ADOKA",
        "role": "ato",
        "area_office": "ATO ADOKA",
        "password": "pass165"
    },
    {
        "username": "ato_onyagede",
        "email": "atoonyagede@mailhost.com",
        "first_name": "ATO",
        "last_name": "ONYAGEDE",
        "role": "ato",
        "area_office": "ATO ONYAGEDE",
        "password": "pass166"
    },
    {
        "username": "ato_ugbokolo",
        "email": "atougbokolo@mailhost.com",
        "first_name": "ATO",
        "last_name": "UGBOKOLO",
        "role": "ato",
        "area_office": "ATO UGBOKOLO",
        "password": "pass167"
    },
    {
        "username": "ato_eupi",
        "email": "atoeupi@mailhost.com",
        "first_name": "ATO",
        "last_name": "EUPI",
        "role": "ato",
        "area_office": "ATO EUPI",
        "password": "pass168"
    },
    {
        "username": "mla_benue_links",
        "email": "mlabenuelinks@mailhost.com",
        "first_name": "MLA",
        "last_name": "BENUE LINKS",
        "role": "ato",
        "area_office": "MLA BENUE LINKS",
        "password": "pass169"
    },
    {
        "username": "mla_headquarters",
        "email": "mlaheadquarters@mailhost.com",
        "first_name": "MLA",
        "last_name": "HEADQUARTERS",
        "role": "ato",
        "area_office": "MLA HEADQUARTERS",
        "password": "pass170"
    },
    {
        "username": "mla_centralward",
        "email": "mlacentralward@mailhost.com",
        "first_name": "MLA",
        "last_name": "CENTRAL WARD",
        "role": "ato",
        "area_office": "MLA CENTRAL WARD",
        "password": "pass171"
    },
    {
        "username": "withholdingtax",
        "email": "withholdingtax@mailhost.com",
        "first_name": "WITHHOLDING",
        "last_name": "TAX",
        "role": "ato",
        "area_office": "WITHHOLDING TAX",
        "password": "pass172"
    }

]




class Command(BaseCommand):

    help = "Seed ATO accounts safely"

    def handle(self, *args, **kwargs):

        for ato in ATOS:

            user, created = User.objects.update_or_create(
                username=ato["username"],
                defaults={
                    "email": ato["email"],
                    "first_name": ato["first_name"],
                    "last_name": ato["last_name"],
                    "gokollect_code": ato.get(
                        "gokollect_code"
                    ),
                    "role": ato["role"],
                    "area_office": ato["area_office"],
                    "is_active": True,
                }
            )

            if created:
                user.set_password(ato["password"])
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created {user.username}"
                    )
                )

            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Updated {user.username}"
                    )
                )