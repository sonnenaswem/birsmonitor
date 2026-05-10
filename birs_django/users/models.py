from django.db import models

from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("director", "Director"),
        ("auditor", "Auditor"),
        ("ato", "ATO"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="admin")
    area_office = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    hospital = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    gokollect_code = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True
    )
    @property
    def full_name(self):
        """Returns the user's full name for the frontend."""
        return f"{self.first_name} {self.last_name}".strip() or self.username

    def save(self, *args, **kwargs):
        self.role = self.role.lower()

        if self.gokollect_code:
            self.gokollect_code = self.gokollect_code.strip().upper()

        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=["role"]),
            models.Index(fields=["area_office"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.role})"
