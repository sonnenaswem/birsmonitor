from django.db import models
from users.models import CustomUser
from django.conf import settings

class PerformanceSummary(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="performance_summaries")
    ato_name = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2)
    remita = models.CharField(max_length=15)
    interswitch = models.CharField(max_length=25)
    gokollect = models.CharField(max_length=25)
    date_uploaded = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.ato_name} - {self.total_amount}"
    


class PerformanceTarget(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="targets"
    )
    month = models.IntegerField()
    year = models.IntegerField()
    # Using Decimal for financial precision
    target_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevents duplicate targets for the same ATO in the same month
        unique_together = ('user', 'month', 'year')
        indexes = [
            models.Index(fields=["month", "year"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.month}/{self.year} (Target: ₦{self.target_amount})"
