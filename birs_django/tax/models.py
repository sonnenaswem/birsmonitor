from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from users.models import CustomUser
User = get_user_model()

RECONCILIATION_STATUS = (
    ("pending", "Pending"),
    ("matched", "Matched"),
    ("amount_mismatch", "Amount Mismatch"),
    ("missing_softnet", "Missing Softnet"),
    ("duplicate", "Duplicate"),
    ("failed", "Failed"),
)

VERIFICATION_STATUS = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("verified", "Verified"),
        ("failed", "Failed"),
        ("mismatch", "Mismatch"),
        ("duplicate", "Duplicate"),
    ]

class TaxEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="tax_entries",
        null=True, blank=True
    )
    tax_item = models.CharField(max_length=100)
    subhead = models.CharField(max_length=100)
    remita = models.CharField(max_length=100, unique=True, null=True, blank=True)  
    interswitch_ref = models.CharField(max_length=100, unique=True, null=True, blank=True)
    gokollect = models.CharField(max_length=100, unique=True, null=True, blank=True)
    remita_verified = models.BooleanField(default=False)
    interswitch_verified = models.BooleanField(default=False)
    gokollect_verified = models.BooleanField(default=False)
    remita_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    interswitch_amount = models.DecimalField(max_digits=50, decimal_places=2, null=True, blank=True)
    gokollect_amount = models.DecimalField(max_digits=25, decimal_places=2, default=0)
    gross_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    birs_split_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    institution_split_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    novus_split_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    tagkonsult_split_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    area_office = models.CharField(max_length=100, db_index=True)
    taxpayer_name = models.CharField(max_length=255, null=True, blank=True)
    date_of_remittance = models.DateField(null=True, blank=True)
    vehicle_type = models.CharField(max_length=100, null=True, blank=True)
    registration_number = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, editable=False)
    payment_status = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )
    source = models.CharField(
        max_length=20,
        choices=[('POS', 'POS'), ('Manual', 'Manual')],
        default='Manual'
    )
    pos_terminal = models.ForeignKey(
        "PosTerminal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tax_entries"
    )
    # SOFTNET RECONCILIATION
    softnet_verified = models.BooleanField(default=False)
    softnet_verified_at = models.DateTimeField(null=True, blank=True)

    softnet_status = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    softnet_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    softnet_data = models.JSONField(
        default=dict,
        blank=True
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default="pending"
    )

    verification_attempts = models.IntegerField(default=0)

    last_verification_attempt = models.DateTimeField(
        null=True,
        blank=True
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    reconciliation_status = models.CharField(
        max_length=50,
        choices=RECONCILIATION_STATUS,
        default="pending"
    )

    reconciliation_notes = models.TextField(
        blank=True,
        null=True
    )
    data = models.JSONField(null=True, blank=True)
    external_source = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    date_uploaded = models.DateTimeField(auto_now_add=True)
    month = models.IntegerField()
    year = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["remita"],
                condition=Q(remita__isnull=False),
                name="unique_remita_when_present"
            ),
            models.UniqueConstraint(
                fields=["interswitch_ref"],
                condition=Q(interswitch_ref__isnull=False),
                name="unique_interswitch_when_present"
            ),
            models.UniqueConstraint(
                fields=["gokollect"],
                condition=Q(gokollect__isnull=False),
                name="unique_gokollect_when_present"
            ),
            models.UniqueConstraint(
                fields=["softnet_reference"],
                condition=Q(softnet_reference__isnull=False),
                name="unique_softnet_reference_when_present"
            ),
        ]
        indexes = [
            models.Index(fields=["month", "year"]),
            models.Index(fields=["date_uploaded"]),
            models.Index(fields=["date_of_remittance"]),
            models.Index(fields=["source"]),
            models.Index(fields=["tax_item"]),
            models.Index(fields=["gokollect"]),
            models.Index(fields=["remita"]),
            models.Index(fields=["interswitch_ref"]),
            models.Index(fields=["softnet_reference"]),
            models.Index(fields=["reconciliation_status"]),
        ]

    def save(self, *args, **kwargs):
        if self.date_of_remittance:
            self.month = self.date_of_remittance.month
            self.year = self.date_of_remittance.year
        
        r_amt = self.remita_amount or 0
        i_amt = self.interswitch_amount or 0
        g_amt = self.gokollect_amount or 0
        self.total_amount = r_amt + i_amt + g_amt
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.area_office} - {self.tax_item} (₦{self.total_amount})"


class MonthlyLeagueSnapshot(models.Model):
    month = models.IntegerField()
    year = models.IntegerField()
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"League {self.month}/{self.year}"
    

class PosTerminal(models.Model):
    terminal_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True
    )
    ato = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="pos_terminals")
    station_name = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    CHANNEL_CHOICES = [
        ("softnet", "Softnet"),
        ("gokollect", "Gokollect"),
    ]

    channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        default="softnet"
    )
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    provider = models.CharField(max_length=100, blank=True, null=True)
    softnet_ato_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True
    )

    softnet_ato_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not self.ato or self.ato.role != "ato":
            raise ValidationError("Only ATO users can be assigned POS terminals.")
    
    def save(self, *args, **kwargs):
        if self.terminal_id:
            self.terminal_id = self.terminal_id.strip().upper()

        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.terminal_id} -> {self.ato.username}"


class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('verify', 'Verified'),
    ]

    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    tax_entry = models.ForeignKey(TaxEntry, on_delete=models.CASCADE, related_name="audit_logs")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default="update")
    changes = models.JSONField(help_text="Store old vs new values here")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.performed_by.username} modified {self.tax_entry.id}"


class GokollectInstitutionMapping(models.Model):
    institution_name = models.CharField(
        max_length=255,
        unique=True
    )

    institution_code = models.CharField(
        max_length=100,
        unique=True
    )

    ato = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="gokollect_institutions"
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.ato.role != "ato":
            raise ValidationError(
                "Only ATO users can be mapped."
            )
        
    def save(self, *args, **kwargs):
        if self.institution_name:
            self.institution_name = (
                self.institution_name.strip().upper()
            )

        if self.institution_code:
            self.institution_code = (
                self.institution_code.strip().upper()
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.institution_name} -> {self.ato.username}"


class ExternalSyncLog(models.Model):
    provider = models.CharField(max_length=50)
    terminal_id = models.CharField(max_length=100)

    last_synced_at = models.DateTimeField(null=True, blank=True)

    last_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        default="success"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.provider} - {self.terminal_id}"