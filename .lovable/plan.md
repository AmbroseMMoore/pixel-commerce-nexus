

## Admin Access Plan for WhatsApp Cart Reminder System

### Overview

Admins will access the WhatsApp abandoned cart reminder system through a dedicated admin page (`/admin/cart-reminders`) with a new sidebar navigation item. This page will provide full visibility and control over the reminder system.

---

### 1. Admin Navigation - Add New Sidebar Item

**File: `src/components/admin/AdminSidebar.tsx`**

Add a new navigation item in the sidebar:

```typescript
{
  icon: <MessageCircle size={20} />,  // from lucide-react
  label: "Cart Reminders",
  href: "/admin/cart-reminders"
}
```

Position it after "Customers" in the navigation to group customer-related features together.

---

### 2. Admin Cart Reminders Dashboard

**File: `src/pages/admin/AdminCartReminders.tsx`**

Create a comprehensive dashboard with the following sections:

#### 2.1 Overview Stats Cards (Top Row)
| Card | Description |
|------|-------------|
| **Abandoned Carts** | Total carts currently in reminder flow |
| **Reminders Sent Today** | Number of WhatsApp messages sent today |
| **Conversion Rate** | % of abandoned carts that converted to orders |
| **Total Recovered Revenue** | Sum of order values from converted carts |

#### 2.2 Abandoned Carts Table (Main Section)

Display all tracked abandoned carts with columns:

| Column | Description |
|--------|-------------|
| Customer Name | From customers table |
| Phone Number | WhatsApp number (formatted) |
| Cart Value | Total value of items in cart |
| Items | Count of products in cart |
| Reminder Step | Current step (1-5) with progress indicator |
| Last Sent | When the last reminder was sent |
| Next Reminder | Scheduled time for next reminder |
| Status | Active / Converted / Stopped |
| Actions | View Details, Pause, Stop, Send Now |

#### 2.3 Action Buttons

| Action | Description |
|--------|-------------|
| **View Details** | Opens modal showing cart items, full message history, and customer info |
| **Pause/Resume** | Temporarily pause reminders for this customer |
| **Stop** | Permanently stop reminders (marks is_stopped = true) |
| **Send Now** | Manually trigger the next reminder immediately |

#### 2.4 Filters and Search

- **Search**: By customer name or phone number
- **Status Filter**: All / Active / Converted / Stopped
- **Reminder Step Filter**: Step 1 / Step 2 / Step 3 / Step 4 / Step 5
- **Date Range**: Filter by cart abandonment date

---

### 3. Reminder Schedule Configuration

**Location: Settings tab within Cart Reminders page OR as a separate section**

Admin can configure the reminder schedule:

| Setting | Description | Default |
|---------|-------------|---------|
| Step 1 Delay | Hours after cart abandonment | 2 hours |
| Step 2 Delay | Hours after Step 1 | 22 hours (24 total) |
| Step 3 Delay | Hours after Step 2 | 24 hours (48 total) |
| Step 4 Delay | Hours after Step 3 | 24 hours (72 total) |
| Step 5 Delay | Hours after Step 4 | 24 hours (96 total) |
| Discount Code (Step 3) | Code to offer | COMEBACK10 |
| Discount % (Step 3) | Percentage off | 10% |
| Discount Code (Step 4-5) | Code for final offers | COMEBACK15 |
| Discount % (Step 4-5) | Percentage off | 15% |

#### Enable/Disable Toggle
- Master toggle to enable/disable the entire reminder system
- When disabled, no new reminders are sent and cron jobs skip processing

---

### 4. Message Preview Section

Show admins exactly what messages customers will receive at each step:

**Step 1 - Reminder:**
```
Hi {Customer Name}! 👋

You left some amazing items in your cart at CuteBae:

• {Product 1 Name}
• {Product 2 Name}

Complete your order now before they're gone! 🛒

👉 Shop Now: {Cart Link}
```

**Step 3 - Discount:**
```
Hi {Customer Name}! 🎉

We saved your cart and here's a special treat just for you:

• {Product 1 Name}
• {Product 2 Name}

Use code *COMEBACK10* for *10% OFF* your order!

👉 Shop Now: {Cart Link}
```

---

### 5. WhatsApp Integration Status Card

Show connection status and configuration:

| Field | Description |
|-------|-------------|
| **Connection Status** | Connected / Not Connected / Error |
| **Phone Number** | The WhatsApp business number being used |
| **Templates Status** | Approved / Pending / Rejected (for each template) |
| **Messages Sent (Today)** | Count with remaining quota |
| **Last Sync** | When templates were last synced from Meta |

#### Quick Actions:
- **Test Connection**: Send a test message to admin's phone
- **Refresh Templates**: Sync template status from Meta API
- **View Logs**: Link to message delivery logs

---

### 6. Analytics & Reports Section

#### Conversion Funnel Chart
Visual funnel showing:
```
Abandoned Carts (100%)
    ↓
Received Step 1 (95%)
    ↓
Received Step 2 (60%)
    ↓
Received Step 3 with Discount (40%)
    ↓
Converted (15%)
```

#### Conversion by Step Chart
Bar chart showing which reminder step leads to most conversions:
- Step 1: X% conversions
- Step 2: Y% conversions
- Step 3 (10% discount): Z% conversions
- etc.

#### Time-based Analytics
- Best time of day for conversions
- Average time to conversion after first reminder
- Day-of-week performance

---

### 7. Routing & Protection

**File: `src/App.tsx`**

Add the new protected route:

```typescript
<Route path="/admin/cart-reminders" element={
  <AdminProtectedRoute>
    <AdminCartReminders />
  </AdminProtectedRoute>
} />
```

---

### 8. Database Tables for Admin Access

#### Table: `cart_abandonment_tracking`
Admins need full access to view and manage records.

RLS Policy:
```sql
CREATE POLICY "Admins can manage cart abandonment tracking"
ON cart_abandonment_tracking FOR ALL
USING (is_admin());
```

#### Table: `cart_reminder_schedule`
Admins can view and edit the reminder schedule.

#### Table: `cart_reminder_logs` (New)
Track all sent messages for audit and debugging:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tracking_id | UUID | FK to cart_abandonment_tracking |
| customer_id | UUID | Customer who received message |
| reminder_step | INTEGER | Which step was sent |
| message_template | TEXT | Which template was used |
| whatsapp_message_id | TEXT | ID returned from Meta API |
| delivery_status | TEXT | sent / delivered / read / failed |
| sent_at | TIMESTAMPTZ | When message was sent |
| error_message | TEXT | Error details if failed |

---

### 9. Files to Create/Modify

#### New Files:
| File | Purpose |
|------|---------|
| `src/pages/admin/AdminCartReminders.tsx` | Main admin dashboard page |
| `src/hooks/useCartReminders.ts` | Hook to fetch/manage reminder data |
| `src/components/admin/CartReminderDetailsModal.tsx` | Modal for viewing cart/message details |
| `src/components/admin/ReminderScheduleEditor.tsx` | Component to edit reminder timing |
| `src/components/admin/WhatsAppStatusCard.tsx` | Integration status display |

#### Modified Files:
| File | Change |
|------|--------|
| `src/components/admin/AdminSidebar.tsx` | Add Cart Reminders nav item |
| `src/App.tsx` | Add route for `/admin/cart-reminders` |
| `supabase/config.toml` | Add edge function configs |

---

### 10. Admin Workflow Example

1. **Admin logs into admin panel**
2. **Clicks "Cart Reminders" in sidebar**
3. **Sees dashboard with:**
   - Overview stats showing 25 active abandoned carts, 12% conversion rate
   - Table of all tracked carts with status
4. **Wants to check a specific customer:**
   - Searches by phone number
   - Clicks "View Details"
   - Sees cart items, all messages sent, and delivery status
5. **Customer complained about too many messages:**
   - Admin clicks "Stop" to halt reminders for that customer
6. **Wants to adjust discount:**
   - Goes to Settings tab
   - Changes COMEBACK10 to SAVE10 with 15% off
   - Saves - new reminders will use updated code

---

### Implementation Order

1. **First**: Create database tables (`cart_abandonment_tracking`, `cart_reminder_schedule`, `cart_reminder_logs`)
2. **Second**: Add WhatsApp API secrets to Supabase
3. **Third**: Create edge functions (`track-cart-abandonment`, `send-cart-reminder`)
4. **Fourth**: Build admin UI (`AdminCartReminders.tsx` with all components)
5. **Fifth**: Set up cron jobs to run the edge functions
6. **Sixth**: Test end-to-end with admin's phone number

