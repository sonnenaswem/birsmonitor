import logging

from celery import shared_task

from tax.services.sync_service import (
    sync_gokollect_transactions
)

from tax.services.softnet_service import (
    pull_softnet_transactions
)

logger = logging.getLogger(__name__)


@shared_task
def sync_gokollect_task():

    sync_gokollect_transactions(limit_pages=10)

    logger.info(
        "GoKollect sync complete"
    )

    return "GoKollect sync complete"


@shared_task
def sync_softnet_task():

    pull_softnet_transactions()

    logger.info(
        "Softnet sync complete"
    )

    return "Softnet sync complete"


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_kwargs={"max_retries": 5},
)
def process_softnet_webhook_task(
    self,
    payload
):

    from tax.services.reconciliation_service import (
        process_softnet_transaction
    )

    try:

        process_softnet_transaction(payload)

        logger.info(
            "Softnet webhook processed successfully"
        )

    except Exception as e:

        logger.exception(
            f"Softnet webhook processing failed: {str(e)}"
        )

        raise
