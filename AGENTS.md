# BIRS Revenue Monitoring System — Agent Instructions

## Repository structure

This is one Git repository containing:

* `birs_django/` — Django 5.2 backend
* `birs-frontend/` — Next.js frontend
* `.venv/` — Python virtual environment at repository root

Production paths:

* Repository: `/var/www/birsmonitor`
* Backend: `/var/www/birsmonitor/birs_django`
* Frontend: `/var/www/birsmonitor/birs-frontend`
* Python environment: `/var/www/birsmonitor/.venv`
* Gunicorn socket: `/var/www/birsmonitor/birs_django/gunicorn.sock`

Production services include:

* PostgreSQL
* Redis
* Gunicorn
* Celery worker
* Celery beat
* Nginx
* Next.js frontend process

## Working agreement

* Treat the local repository as the source of truth.
* Treat the VPS as a deployment environment, not a development workspace.
* Do not edit production application code directly unless explicitly instructed during an emergency.
* Inspect relevant code before modifying it.
* Do not assume file contents, model fields, endpoint paths, service names, or deployment commands.
* Explain every proposed change with exact file paths and affected behavior.
* Prefer surgical changes over broad rewrites.
* Preserve existing frontend API response shapes unless a coordinated frontend change is included.
* Do not perform destructive Git commands without explicit approval.
* Never run `git reset --hard`, `git clean -fd`, delete `.venv`, delete the database, or reclone the production repository as a routine fix.
* Do not modify database records, schema, migrations, production environment variables, Nginx, systemd, or service credentials without first explaining the impact.
* Never expose passwords, API keys, JWTs, database URLs, webhook client IDs, or production secrets in commits or logs.
* Review the diff before considering a task complete.

## Local backend commands

Run from Windows PowerShell:

```powershell
cd C:\Users\user\Desktop\BIRS
.\.venv\Scripts\Activate.ps1
cd birs_django
python manage.py check
```

Run backend tests from `birs_django/`:

```powershell
python manage.py test
```

For performance-only work:

```powershell
python manage.py test performance
```

Do not run `npm` commands inside `birs_django/`.

## Local frontend commands

Run from Windows PowerShell:

```powershell
cd C:\Users\user\Desktop\BIRS\birs-frontend
npm run build
```

Do not run Django, Gunicorn, migration, or Python commands inside `birs-frontend/`.

## Production command rules

A backend Python-only change normally requires:

1. Activate `/var/www/birsmonitor/.venv`
2. Enter `/var/www/birsmonitor/birs_django`
3. Run `python manage.py check`
4. Restart Gunicorn

A model or migration change additionally requires:

1. Review migration files
2. Back up the production database where appropriate
3. Run `python manage.py migrate --plan`
4. Run `python manage.py migrate`
5. Restart affected services

A Celery task or scheduled-task change may require restarting:

* Gunicorn
* Celery worker
* Celery beat

A frontend `.ts`, `.tsx`, CSS, or Next.js change requires:

1. Enter `/var/www/birsmonitor/birs-frontend`
2. Install dependencies only when package files changed
3. Run `npm run build`
4. Restart the confirmed frontend process

Never run `npm run build` as a remedy for a Django backend exception.

Never restart Gunicorn as a remedy for a Next.js compilation failure.

## Git and deployment rules

* Development happens on a feature or stabilization branch.
* `main` represents production-ready code.
* Do not pull into a dirty VPS working tree.
* Before deployment, run `git status --short`.
* Use fast-forward-only pulls on production.
* Do not automatically merge diverged branches on the VPS.
* Preserve any VPS-only changes as a patch before reconciling.
* Do not commit `.env`, logs, database dumps, uploaded media, `.venv`, `node_modules`, `.next`, secrets, or generated production files.
* Large log files must not be tracked.

## Revenue business rules

* Softnet is a verification and transaction provider, not a displayed payment channel.
* Remita transactions remain Remita.
* GoKollect transactions remain GoKollect.
* Unmatched Softnet revenue is classified as Interswitch according to the confirmed business rule.
* `date_of_remittance` is the actual transaction/payment date used for filtering, KPIs, charts, and league calculations.
* Import or upload time must not replace the real payment date.
* POS transactions are immutable.
* Manual entries may only be deleted under the existing authorized-role rules.
* Raw external provider payloads must be preserved where the existing design requires them.
* Do not silently change transaction classification, user assignment, terminal mapping, collector-code mapping, or reconciliation rules.

## Current investigation priorities

1. Stabilize the admin dashboard.
2. Confirm default dashboard data means the real current calendar month.
3. Confirm date filters override the default period correctly.
4. Confirm first-day-of-month data is not forcibly zeroed.
5. Diagnose why league revenue appears under only one ATO.
6. Audit transaction-to-ATO assignment.
7. Audit performance views and API response consistency.
8. Audit Softnet pull, webhook, verification, date mapping, reconciliation, and duplicate prevention.
9. Audit GoKollect collector-code and terminal mappings.
10. Create a documented, repeatable production deployment process.

## Completion requirements

Before declaring a code task complete:

* Run appropriate Django checks or frontend builds.
* Run relevant tests where available.
* Review the final diff.
* State which files changed.
* State which commands were run.
* State what remains unverified.
* Do not deploy automatically.
