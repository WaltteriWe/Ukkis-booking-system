# ⚡ Quick Reference Card - Booking Approval & Rejection

## 📍 API Endpoints

### Approve
```bash
POST /bookings/:id/approve
{"adminMessage": "optional text"}
```

### Reject
```bash
POST /bookings/:id/reject
{"rejectionReason": "required text"}
```

---

## 🎯 Status Values

```
"pending"   → Waiting for admin
"approved"  → Admin said yes ✅
"rejected"  → Admin said no ❌
```

---

## ✉️ Emails Sent

| Action | Email Color | Subject |
|--------|------------|---------|
| Approve | 🟢 Green | ✅ Your booking approved |
| Reject | 🔴 Red | ⚠️ Booking Status Update |

---

## 💾 Database Fields

| Field | Values | Purpose |
|-------|--------|---------|
| `approvalStatus` | pending/approved/rejected | Decision |
| `adminMessage` | text (optional) | Approval message |
| `rejectionReason` | text (optional) | Rejection reason |

---

## 🔧 Frontend Code

### Approve
```typescript
fetch(`/bookings/${id}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ adminMessage: "text" })
})
```

### Reject
```typescript
fetch(`/bookings/${id}/reject`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rejectionReason: "text" })
})
```

---

## 🧪 Test Commands

```bash
# Approve
curl -X POST http://localhost:3000/bookings/1/approve \
  -H "Content-Type: application/json" \
  -d '{"adminMessage":"Welcome!"}'

# Reject
curl -X POST http://localhost:3000/bookings/1/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason":"Fully booked"}'
```

---

## ❌ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success ✅ |
| 400 | Bad request |
| 404 | Not found |
| 500 | Server error |

---

## 📋 Admin Workflow

```
1. See Pending Booking
2. Read Details
3. Click [Approve] or [Reject]
4. [Approve] → Enter optional message
   [Reject] → Enter required reason
5. Submit
6. Email sent automatically
7. Status updated
```

---

## 🎨 Status Badge

```tsx
{approvalStatus === 'approved' && <span>✓ Approved</span>}
{approvalStatus === 'rejected' && <span>✗ Rejected</span>}
{approvalStatus === 'pending' && <span>⏳ Pending</span>}
```

---

## 📧 What Gets Emailed

### Approval Email
- ✅ Confirmation message
- 📋 Booking details
- 👕 Gear sizes
- 💬 Admin message (if provided)
- 📍 Next steps

### Rejection Email
- ❌ Explanation
- 📋 Booking info
- 🔴 Rejection reason (REQUIRED)
- 💡 Alternatives
- 📞 Contact info

---

## 🚀 Getting Started

1. **Review Docs:**
   - `APPROVAL_REJECTION_API.md` - Full reference
   - `APPROVAL_REJECTION_COMPLETE.md` - Complete guide

2. **Implement UI:**
   - Approval dialog (optional message)
   - Rejection dialog (required reason)
   - Status badges

3. **Add Buttons:**
   - Approve button (calls POST /approve)
   - Reject button (calls POST /reject)

4. **Test:**
   - Create test booking
   - Approve → Check email
   - Create another, reject → Check email

---

## 📂 Files Changed

✅ `schema.prisma` - Added fields
✅ `bookingController.ts` - Added rejectBooking()
✅ `emailController.ts` - Added sendRejectionEmail()
✅ `bookingRoutes.ts` - Added /reject endpoint
✅ Migration - Database update

---

## ⚙️ Configuration

```bash
SMTP_HOST=smtp.server.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=password
SMTP_FROM=noreply@domain.com
```

Without SMTP → Demo mode (logs to console)

---

## ✅ Ready For

- ✅ Approval functionality
- ✅ Rejection functionality
- ✅ Email sending
- ✅ Database storage
- ✅ Error handling
- ✅ Validation

**Waiting For:**
- ⏳ Frontend implementation

---

## 💡 Pro Tips

1. **Rejection reason is REQUIRED** - Always require it
2. **Approval message is optional** - Nice to have
3. **Emails are non-blocking** - Failures don't stop updates
4. **Check logs for emails** - Debug with console output
5. **Status persists** - Once approved/rejected, won't change auto

---

## 🎯 Common Use Cases

### Case 1: Approve with Welcome
```
Admin: "Thank you for booking! Pack warm! 🏔️"
→ Email: Confirmation + message
```

### Case 2: Reject with Alternative
```
Admin: "Dec 15 is full. Try Dec 18-20?"
→ Email: Rejection + suggestion
```

### Case 3: Reject Quickly
```
Admin: "Date not available"
→ Email: Short, simple rejection
```

---

**Quick Ref Version 1.0 - Dec 3, 2025**
