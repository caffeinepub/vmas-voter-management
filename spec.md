# VMAS - Voter Management

## Current State
Phase 1 is complete with:
- Voter CRUD (list, add, edit, view, delete)
- Role-based access (superAdmin, dataEntry, viewer)
- Analytics dashboard with stat cards, pie charts, bar charts (horizontal), growth line chart
- Settings: dropdown manager, custom fields, user management
- Label printing (PDF)
- Dark mode toggle
- All data stored in localStorage

## Requested Changes (Diff)

### Add
1. **Bulk Messaging / WhatsApp Page** (`/messaging`)
   - Saved message templates stored in localStorage, with a Male/Female gender tag per template
   - List of templates with name, gender tag, preview text
   - Add/Edit/Delete template modal (Super Admin only can add/edit/delete; all roles can use)
   - "Send via WhatsApp" button per template: opens `https://wa.me/?text=<encoded template>` in new tab
   - Template can include placeholders like `{name}`, `{voterId}` which are replaced at send-time

2. **Task Manager Page** (`/tasks`)
   - Task types: Follow-up Call, Field Visit, Campaign Event, Other
   - Super Admin can create tasks and assign to any user
   - Tasks linked to specific voters (optional)
   - Task fields: title, type, assigned user, linked voter (optional), due date, status (Pending/In Progress/Done), notes
   - All roles can view tasks assigned to them; Super Admin sees all tasks
   - Task list with filter by status, type, assigned user
   - Mark task as done inline

3. **SMS from Voter List (selected voters)**
   - Checkbox column in voters list for row selection
   - "Send SMS" button appears when ≥1 voter selected
   - Clicking shows a modal with: "SMS feature not available" error message and a note to contact admin to enable SMS integration
   - Option to copy selected mobile numbers to clipboard as fallback

### Modify
4. **Dashboard Charts** -- Change Education Breakdown and Profession Breakdown from horizontal `layout="vertical"` BarChart to vertical bar chart (`layout="horizontal"`, XAxis = category, YAxis = number), with angled labels for readability.

5. **Navigation / Layout** -- Add "Messaging" and "Tasks" menu items to the sidebar and mobile menu.

6. **App.tsx routing** -- Add routes for `messaging` and `tasks` pages.

7. **types.ts** -- Add `MessageTemplate` and `Task` types.

### Remove
Nothing removed.

## Implementation Plan
1. Add `MessageTemplate` and `Task` types to `store/types.ts`
2. Create `store/messaging.ts` -- CRUD for templates in localStorage
3. Create `store/tasks.ts` -- CRUD for tasks in localStorage
4. Create `pages/MessagingPage.tsx` -- template list, add/edit modal, WhatsApp send
5. Create `pages/TasksPage.tsx` -- task list, create task modal, status update
6. Update `pages/VotersListPage.tsx` -- add checkbox selection, Send SMS button + modal
7. Update `pages/DashboardPage.tsx` -- flip Education and Profession charts to vertical
8. Update `components/Layout.tsx` -- add Messaging and Tasks nav items
9. Update `App.tsx` -- add messaging and tasks routes

## UX Notes
- Messaging page accessible to all roles; template management (add/edit/delete) is Super Admin only
- WhatsApp link opens in new tab (`wa.me` deep link with pre-filled text)
- SMS modal shows a clear "not available" error with a clipboard copy fallback
- Task creation is Super Admin only; all users can see tasks assigned to them and mark done
- Vertical bar charts use angled x-axis labels (angle=-35) with truncation for long labels
- Use existing `#0b0854` brand color, `#e3dec5` dropdown background, dark mode compatible
