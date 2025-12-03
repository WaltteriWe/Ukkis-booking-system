# 📝 Booking Approval & Rejection API Guide

## Overview

Admins can now:
1. **✅ Approve** bookings → Send approval confirmation email
2. **❌ Reject** bookings → Send rejection reason email

---

## API Endpoints

### 1. Approve a Booking
```
POST /bookings/:id/approve
```

**Request:**
```json
{
  "adminMessage": "Welcome to the Arctic adventure!"
}
```

**Response:**
```json
{
  "id": 123,
  "approvalStatus": "approved",
  "adminMessage": "Welcome to the Arctic adventure!",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  ...
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/bookings/123/approve \
  -H "Content-Type: application/json" \
  -d '{"adminMessage": "Your tour has been approved!"}'
```

---

### 2. Reject a Booking
```
POST /bookings/:id/reject
```

**Request:**
```json
{
  "rejectionReason": "Unfortunately, we don't have availability on that date. Please check other dates."
}
```

**Response:**
```json
{
  "id": 123,
  "approvalStatus": "rejected",
  "rejectionReason": "Unfortunately, we don't have availability...",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  ...
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/bookings/123/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Date not available"}'
```

---

## Database Fields

### New Fields in Booking Table

| Field | Type | Purpose |
|-------|------|---------|
| `approvalStatus` | String | `"pending"` / `"approved"` / `"rejected"` |
| `adminMessage` | String (optional) | Message sent with approval |
| `rejectionReason` | String (optional) | Reason for rejection |

---

## Email Templates

### Approval Email 💚
**Theme:** Green (Positive)
- Subject: ✅ Your booking has been approved
- Content: Confirmation with all details
- Admin message included
- Preparation instructions

### Rejection Email ❌
**Theme:** Red (Negative)
- Subject: ⚠️ Booking Status Update
- Content: Explanation with rejection reason
- Alternative suggestions
- Contact information

---

## Admin Workflow

### Approval Workflow
```
1. Admin sees pending booking
   ↓
2. Admin reviews booking details
   ↓
3. Admin clicks [Approve]
   ↓
4. Admin (optional) adds welcome message
   ↓
5. System updates database
   approvalStatus: "pending" → "approved"
   ↓
6. Approval email sent to customer
   ↓
7. Booking confirmed ✅
```

### Rejection Workflow
```
1. Admin sees pending booking
   ↓
2. Admin reviews booking details
   ↓
3. Admin clicks [Reject]
   ↓
4. Admin enters rejection reason
   (required field)
   ↓
5. System updates database
   approvalStatus: "pending" → "rejected"
   rejectionReason: "..."
   ↓
6. Rejection email sent to customer
   with reason
   ↓
7. Booking cancelled ❌
```

---

## Status Values

### Approval Status Field
```
"pending"   → Awaiting admin decision
"approved"  → Admin approved, email sent
"rejected"  → Admin rejected, reason sent
```

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Approval/rejection completed |
| 400 | Bad Request | Missing or invalid data |
| 404 | Not Found | Booking doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Error Scenarios

### Missing Rejection Reason
```json
Status: 400
{
  "issues": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["rejectionReason"],
      "message": "Rejection reason is required"
    }
  ]
}
```

### Booking Not Found
```json
Status: 404
{
  "status": 404,
  "error": "Booking not found"
}
```

### Email Failure (Non-blocking)
```json
Status: 200
{
  "id": 123,
  "approvalStatus": "approved",
  ...
}
Console: ❌ Failed to send approval email for booking 123: [error]
```
(Booking is still approved even if email fails)

---

## Frontend Implementation

### Approval Button
```tsx
<button onClick={() => approveBooking(booking.id, message)}>
  ✅ Approve & Send Confirmation
</button>
```

### Rejection Button
```tsx
<button onClick={() => rejectBooking(booking.id, reason)}>
  ❌ Reject & Send Reason
</button>
```

### Status Display
```tsx
{booking.approvalStatus === 'approved' && (
  <span className="badge badge-success">✓ Approved</span>
)}
{booking.approvalStatus === 'rejected' && (
  <span className="badge badge-danger">✗ Rejected</span>
)}
{booking.approvalStatus === 'pending' && (
  <span className="badge badge-warning">⏳ Pending</span>
)}
```

---

## JavaScript/TypeScript Examples

### Approve Booking
```typescript
const approveBooking = async (bookingId: number, message?: string) => {
  try {
    const response = await fetch(`/bookings/${bookingId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminMessage: message })
    });

    if (!response.ok) throw new Error('Approval failed');
    
    const booking = await response.json();
    console.log('✅ Booking approved:', booking);
    return booking;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Reject Booking
```typescript
const rejectBooking = async (bookingId: number, reason: string) => {
  try {
    const response = await fetch(`/bookings/${bookingId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionReason: reason })
    });

    if (!response.ok) throw new Error('Rejection failed');
    
    const booking = await response.json();
    console.log('❌ Booking rejected:', booking);
    return booking;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Testing

### Test Approval
```bash
curl -X POST http://localhost:3000/bookings/1/approve \
  -H "Content-Type: application/json" \
  -d '{"adminMessage": "Welcome!"}'

# Response should have approvalStatus: "approved"
```

### Test Rejection
```bash
curl -X POST http://localhost:3000/bookings/1/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Date not available"}'

# Response should have approvalStatus: "rejected"
```

### Check Logs
```bash
# For approval
tail -f backend.log | grep "approval\|Approval"

# For rejection
tail -f backend.log | grep "rejection\|Rejection"
```

---

## Migration Information

**Migration:** `20251203200508_add_admin_message_and_rejection_reason`

New columns added to Booking table:
- `adminMessage` (TEXT, nullable)
- `rejectionReason` (TEXT, nullable)

Updated column:
- `approvalStatus` now supports: "pending", "approved", "rejected"

---

## Summary

✅ **Approval Path:**
1. POST `/bookings/:id/approve`
2. Sends approval email with admin message
3. Status becomes "approved"

❌ **Rejection Path:**
1. POST `/bookings/:id/reject`
2. Sends rejection email with reason
3. Status becomes "rejected"

Both are non-blocking (email failures don't prevent updates).

---

**Last Updated:** December 3, 2025
**Status:** ✅ Production Ready
