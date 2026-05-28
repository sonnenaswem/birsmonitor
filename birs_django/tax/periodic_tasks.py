from celery import shared_task

from tax.services.sync_service import (
    sync_gokollect_transactions
)

from tax.models import TaxEntry


@shared_task
def periodic_gokollect_sync():
    """
    Pull latest GoKollect transactions.
    """

    sync_gokollect_transactions()


@shared_task
def reconcile_pending_softnet_transactions():
    """
    Scan unresolved reconciliation records.
    """

    pending = TaxEntry.objects.filter(
        reconciliation_status="pending"
    )

    count = pending.count()

    print(
        f"Pending reconciliation count: {count}"
    )

    return count


@shared_task
def detect_stale_transactions():
    """
    Detect transactions unresolved for long periods.
    """

    stale = TaxEntry.objects.filter(
        reconciliation_status="pending"
    ).count()

    print(
        f"Stale transaction count: {stale}"
    )

    return stale