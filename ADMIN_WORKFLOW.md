# Admin Workflow (CraftOrigin)

## Access

- **URL:** `/admin` (redirects to `/admin/logs`)
- **No login required** in the current setup (guard allows all).

---

## 1. Activity logs (`/admin/logs`)

**Purpose:** View admin actions and entity changes.

**Flow:**
1. Open **Activity logs** from the sidebar (or go to `/admin/logs`).
2. A table shows:
   - **Time** – when the action happened
   - **Action** – e.g. `USER_UPDATED`, `ARTIST_VERIFIED`, `ORDER_STATUS_CHANGED`
   - **Entity** – USER, ARTIST, ORDER, ARTWORK
   - **Entity ID** – short ID of the affected record
   - **Details** – JSON (e.g. field changes, status transitions)
   - **IP** – admin IP if recorded
3. Data is **read-only** and loaded from the mock admin service (no backend).

---

## 2. Permissions (`/admin/permissions`)

**Purpose:** See which permissions are granted (for future granular access control).

**Flow:**
1. Open **Permissions** from the sidebar (`/admin/permissions`).
2. A grid of cards shows each permission:
   - `MANAGE_USERS`
   - `VERIFY_ARTISTS`
   - `MANAGE_ORDERS`
   - `MANAGE_ARTWORKS`
   - `VIEW_ANALYTICS`
   - `MANAGE_ADMINS`
3. Each card shows the permission name and “Granted &lt;date&gt;”.
4. **Read-only** in the frontend; grant/revoke would be added when the backend supports it.

---

## 3. Verification requests (`/admin/verification`)

**Purpose:** Review and approve or reject artist verification requests.

**Flow:**
1. Open **Verification requests** (`/admin/verification`).
2. List of requests shows:
   - Artist name (or artist ID)
   - **Status:** PENDING, APPROVED, REJECTED
   - Submitted / reviewed dates
   - Document URLs
   - Review notes (if any)
3. For **PENDING** requests:
   - Optionally enter **Review notes**.
   - **Approve** – marks as APPROVED (mock; updates in-memory list).
   - **Reject** – marks as REJECTED (mock; updates in-memory list).
4. After approve/reject, the list refreshes from the mock service; status and notes update in the UI.

---

## 4. System settings (`/admin/settings`)

**Purpose:** View and edit key-value system configuration (mock).

**Flow:**
1. Open **System settings** (`/admin/settings`).
2. Each setting row shows:
   - **Key** (e.g. `maintenance_mode`, `max_upload_mb`, `verification_required`)
   - **Description**
   - **Last updated** time
   - **Value** input and **Save** button
3. Change the value (e.g. `true`/`false`, number, or string) and click **Save**.
4. Mock service updates the value in memory and the UI shows the new value and updated time.

---

## Frontend structure (no backend)

| Item | Location |
|------|----------|
| Models | `CraftOrigin/src/components/admin-dashboard/models.ts` |
| Mock service | `CraftOrigin/src/components/admin-dashboard/admin.service.ts` |
| Guard | `CraftOrigin/src/app/guards/admin.guard.ts` (currently allows all) |
| Shell | `admin-dashboard.component` + `admin-header` |
| Activity logs | `activity-logs/` |
| Permissions | `permissions/` |
| Verification | `verification-requests/` |
| System settings | `system-settings/` |
| Routes | `app.routes.ts` under path `admin` |

All data is **mock only**; switching to real APIs later means replacing `AdminService` methods with `HttpClient` calls to your backend.
