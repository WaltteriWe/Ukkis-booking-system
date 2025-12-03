# 📌 Booking Approval - Quick Reference Card

## 🎯 What Was Done

Added booking approval feature allowing admins to:
1. Approve customer bookings
2. Send automatic confirmation email
3. Add optional custom message

---

## 🚀 API Endpoint

```
POST /bookings/:id/approve
```

### Example Request
```bash
curl -X POST http://localhost:3000/bookings/123/approve \
  -H "Content-Type: application/json" \
  -d '{
    "adminMessage": "Your tour has been approved!"
  }'
```

### Request Body
```json
{
  "adminMessage": "Optional message to customer"
}
```

### Response
```json
{
  "id": 123,
  "approvalStatus": "approved",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "totalPrice": 600,
  // ... other fields
}
```

---

## 📂 Files Changed

```
backend/prisma/schema.prisma
  ↓ Added: approvalStatus STRING DEFAULT 'pending'

backend/src/controllers/bookingController.ts
  ↓ Added: approveBooking(id, body) function

backend/src/controllers/emailController.ts
  ↓ Added: sendApprovalEmail(body) function

backend/src/routes/bookingRoutes.ts
  ↓ Added: POST /bookings/:id/approve endpoint
```

---

## 💻 JavaScript Usage

```typescript
// Simple approval
fetch(`/bookings/123/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ adminMessage: 'Welcome!' })
})
.then(r => r.json())
.then(booking => console.log('Approved:', booking))
.catch(err => console.error('Error:', err));
```

---

## 📊 Database Field

```sql
-- New column added
approvalStatus TEXT DEFAULT 'pending'

-- Values:
'pending'   -- Waiting for approval
'approved'  -- Approved by admin
```

---

## 📧 Email Sent

When approved, customer receives email with:
- ✅ Confirmation message
- ✅ Booking details
- ✅ Gear sizes
- ✅ Admin message (if provided)
- ✅ Next steps

---

## ⚡ Status Codes

| Code | Meaning | Reason |
|------|---------|--------|
| 200 | Success | Booking approved, email sent |
| 404 | Not Found | Booking ID doesn't exist |
| 400 | Bad Request | Invalid request data |

---

## 🧪 Quick Test

```bash
# 1. Create booking
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "packageId":1,
    "participants":2,
    "guestEmail":"test@example.com",
    "guestName":"Test User"
  }'

# 2. Approve booking (use ID from response)
curl -X POST http://localhost:3000/bookings/1/approve \
  -H "Content-Type: application/json" \
  -d '{"adminMessage":"Welcome!"}'

# 3. Check response - should show approvalStatus: "approved"
```

---

## 🎨 Frontend Component (React)

```tsx
<button 
  onClick={() => fetch(`/bookings/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminMessage })
  })}
  disabled={approvalStatus === 'approved'}
>
  {approvalStatus === 'approved' ? '✓ Approved' : 'Approve'}
</button>
```

---

## 🔍 Debug/Logs

### Success Log
```
✅ Approval email sent for booking 123
```

### Error Log
```
❌ Failed to send approval email for booking 123: [error]
```

---

## 📋 Field Reference

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| approvalStatus | string | 'pending' | Initial state |
| approvalStatus | string | 'approved' | After admin approval |
| adminMessage | string (optional) | Any text | Message to customer |

---

## 🎯 Common Scenarios

### Approve without message
```json
{
  "adminMessage": ""
}
```

### Approve with message
```json
{
  "adminMessage": "Your tour is confirmed! We're excited to see you."
}
```

### Already approved
```json
{
  "id": 123,
  "approvalStatus": "approved",  // Can't approve twice
  "message": "Already approved"
}
```

---

## 🚨 Error Responses

### Booking not found
```json
{
  "status": 404,
  "error": "Booking not found"
}
```

### Invalid request
```json
{
  "status": 400,
  "error": "Validation error"
}
```

---

## 📚 Full Documentation

See these files for detailed info:
- `BOOKING_APPROVAL_FEATURE.md` - Complete guide
- `ADMIN_APPROVAL_INTEGRATION.md` - Frontend integration
- `ARCHITECTURE_DIAGRAM.md` - System design
- `README_BOOKING_APPROVAL.md` - Overview

---

## ⚙️ Configuration

Add to `.env`:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@ukkissafaris.com
```

Demo mode works without these (logs to console).

---

## ✅ Implementation Status

- ✅ Database schema updated
- ✅ Backend API ready
- ✅ Email template created
- ✅ Documentation complete
- ⏳ Frontend integration (ready to implement)

---

## 🔗 Endpoints

```
GET  /bookings           → List all bookings
GET  /bookings/:id       → Get single booking
POST /bookings           → Create booking
PUT  /bookings/:id/status → Update status
POST /bookings/:id/approve → APPROVE BOOKING (NEW)
```

---

## 🎓 Learning Path

1. **Understand Flow:** Read ARCHITECTURE_DIAGRAM.md
2. **See Example:** Look at ADMIN_APPROVAL_INTEGRATION.md
3. **Implement UI:** Add button + dialog to admin dashboard
4. **Test API:** Use curl/Postman to test endpoint
5. **Verify Email:** Check inbox for approval email

---

## 💡 Tips

- Optional `adminMessage` parameter
- Email fails gracefully (doesn't block approval)
- Works in demo mode without SMTP
- Database migration already applied
- All existing bookings have `approvalStatus: 'pending'`

---

**Status: Backend ✅ Complete | Frontend ⏳ Ready for Integration**

*December 3, 2025*
