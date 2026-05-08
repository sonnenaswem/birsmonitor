from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from users.models import CustomUser
User = get_user_model()


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
    remita_amount = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True)
    interswitch_amount = models.DecimalField(max_digits=25, decimal_places=2, null=True, blank=True)
    gokollect_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    area_office = models.CharField(max_length=100, db_index=True)
    taxpayer_name = models.CharField(max_length=255, null=True, blank=True)
    date_of_remittance = models.DateField(null=True, blank=True)
    vehicle_type = models.CharField(max_length=100, null=True, blank=True)
    registration_number = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0.00, editable=False)
    source = models.CharField(
        max_length=20,
        choices=[('POS', 'POS'), ('Manual', 'Manual')],
        default='Manual'
    )  
    data = models.JSONField(null=True, blank=True)

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
        ]
        indexes = [
            models.Index(fields=["month", "year"]),
            models.Index(fields=["date_uploaded"]),
            models.Index(fields=["date_of_remittance"]),
            models.Index(fields=["source"]),
            models.Index(fields=["tax_item"]),
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
    terminal_id = models.CharField(max_length=100, unique=True)
    ato = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="pos_terminals")
    station_name = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.ato.role != "ato":
            raise ValidationError("Only ATO users can be assigned POS terminals.")
    
    def save(self, *args, **kwargs):
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

