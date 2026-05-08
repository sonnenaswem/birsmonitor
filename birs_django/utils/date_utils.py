from datetime import datetime, timedelta

def get_current_period():
    """
    Returns the current month and year as integers.
    """
    now = datetime.now()
    return now.month, now.year


def get_last_month_period():
    """
    Returns the previous month and year.
    Handles year rollover (e.g. January -> December of previous year).
    """
    now = datetime.now()
    first_day_this_month = datetime(now.year, now.month, 1)
    last_month_date = first_day_this_month - timedelta(days=1)
    return last_month_date.month, last_month_date.year


def get_current_quarter():
    """
    Returns the current quarter (1–4) and year.
    Quarter is based on calendar months:
    Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec.
    """
    now = datetime.now()
    quarter = (now.month - 1) // 3 + 1
    return quarter, now.year
