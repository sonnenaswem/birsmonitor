import logging
import requests

from django.conf import settings

from tax.services.reconciliation_service import (
    process_softnet_transaction
)

logger = logging.getLogger(__name__)


BASE_URL = (
    "https://service-gateway.bsg.com.ng"
    "/api/transaction-module"
)


class SoftnetService:

    @staticmethod
    def headers():

        return {
            "X-Client-Id": settings.SOFTNET_CLIENT_ID,
            "Accept": "application/json",
        }

    @staticmethod
    def get_all_terminals():

        url = f"{BASE_URL}/ato/terminals"

        response = requests.get(
            url,
            headers=SoftnetService.headers(),
            timeout=60,
        )

        response.raise_for_status()

        return response.json()

    @staticmethod
    def get_transactions_by_terminal(
        terminal_id,
        page=0,
        size=100,
    ):

        url = (
            f"{BASE_URL}"
            f"/ato/by-terminal/{terminal_id}"
        )

        params = {
            "page": page,
            "size": size,
            "sort": "createdAt,desc",
        }

        response = requests.get(
            url,
            headers=SoftnetService.headers(),
            params=params,
            timeout=60,
        )

        response.raise_for_status()

        return response.json()

    @staticmethod
    def get_transaction_by_reference(
        payment_reference
    ):

        url = (
            f"{BASE_URL}"
            f"/ato/by-payment-reference/"
            f"{payment_reference}"
        )

        response = requests.get(
            url,
            headers=SoftnetService.headers(),
            timeout=60,
        )

        if response.status_code == 404:

            return {
                "success": False,
                "message": "Transaction not found",
                "data": None,
            }

        response.raise_for_status()

        return response.json()


def pull_softnet_transactions():

    logger.info(
        "Starting Softnet transaction sync..."
    )

    try:

        terminals_payload = (
            SoftnetService.get_all_terminals()
        )

        terminals = terminals_payload.get(
            "data",
            []
        )

    except Exception as e:

        logger.exception(
            f"Failed to fetch terminals: {str(e)}"
        )

        return

    total_processed = 0

    for terminal in terminals:

        terminal_id = terminal.get(
            "terminalId"
        )

        if not terminal_id:
            continue

        try:

            payload = (
                SoftnetService
                .get_transactions_by_terminal(
                    terminal_id=terminal_id
                )
            )

            transactions = (
                payload.get("data", {})
                .get("content", [])
            )

            for transaction in transactions:

                process_softnet_transaction(
                    transaction
                )

                total_processed += 1

            logger.info(
                f"Softnet sync OK | "
                f"{terminal_id} | "
                f"{len(transactions)} txns"
            )

        except Exception as e:

            logger.exception(
                f"Softnet sync failed | "
                f"{terminal_id} | {str(e)}"
            )

    logger.info(
        f"Softnet sync complete | "
        f"Processed: {total_processed}"
    )