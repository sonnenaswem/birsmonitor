# API Routing Structure - OPTION B Implementation

## NEW ENDPOINTS CREATED

### Admin Routes (under /api/admin/)
- `GET /api/admin/users/` - List all users
- `PATCH /api/admin/users/<id>/update/` - Update user role
- `PATCH /api/admin/users/<id>/delete/` - Delete user
- `PATCH /api/admin/users/<id>/reassign/` - Reassign ATO station
- `POST /api/admin/create-admin-account/` - Create admin account
- `POST /api/admin/create-officer-account/` - Create ATO officer

### Tax Routes (under /api/tax/)
- `GET /api/tax/entries/my/` - Get current user's tax entries
- `GET /api/tax/leaderboard/` - Get performance leaderboard
- (existing routes preserved)

### Aliases for Frontend Compatibility
- `GET /api/performance-summary/` → calls performance_summary view
- `GET /api/leaderboard/` → calls LeaderboardView

## EXISTING ENDPOINTS (UNCHANGED)
- `GET /api/performance/summary/` - Performance summary
- `GET /api/performance/dashboard/` - Admin dashboard
- `GET /api/performance/league/` - League table
- `GET /api/performance/ato/<id>/` - ATO detail
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh token
- All router-registered endpoints (tax-entries, monthly-snapshots)

## FILES MODIFIED
1. **birs_django/users/admin_urls.py** (NEW)
   - Centralized admin routes
   
2. **birs_django/tax/views.py**
   - Added UserTaxEntriesView class
   - Added LeaderboardView class
   
3. **birs_django/tax/urls.py**
   - Added path('entries/my/', ...)
   - Added path('leaderboard/', ...)
   
4. **birs_django/birs_django/urls.py**
   - Added admin routes include
   - Added alias routes for frontend compatibility

## BREAKING CHANGES
None - all existing routes remain functional.

## FRONTEND CALLS NOW SUPPORTED
✅ api.get("/admin/users/")
✅ api.patch(`/admin/users/${id}/update/`, {...})
✅ api.patch(`/admin/users/${id}/delete/`, {...})
✅ api.patch(`/admin/users/${id}/reassign/`, {...})
✅ api.post("/admin/create-admin-account/", {...})
✅ api.post("/admin/create-officer-account/", {...})
✅ api.get("/tax-entries/my/")
✅ api.get("/leaderboard/?month=X&year=Y")
✅ api.get("/performance-summary/")
✅ api.get("/performance/ato/${id}/")
✅ api.get("/performance/league/")

## NEXT STEPS
1. Verify frontend imports/calls match these endpoints
2. Test auth/permissions for new admin routes
3. Consider standardizing date filtering across leaderboard endpoints
