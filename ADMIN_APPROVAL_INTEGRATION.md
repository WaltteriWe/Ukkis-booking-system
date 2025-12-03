# Admin Panel - Booking Approval Integration Guide

## Feature Summary
تقرير الموافقة على الحجوزات - الآن يمكن للمسؤول الموافقة على الحجز وإرسال رسالة تأكيد ثانية للعميل.

After a customer makes a booking, the admin can:
1. ✅ View the booking in the bookings list
2. ✅ See the approval status (pending/approved)
3. ✅ Click approve button
4. ✅ Optionally add a custom message
5. ✅ Automatically send confirmation email to customer

## API Endpoint to Call

```typescript
// Approve a booking
POST /bookings/:id/approve

// Request payload
{
  "adminMessage": "Optional message to customer"
}

// Response returns the updated booking with approvalStatus: "approved"
```

## React Component Example

```typescript
// Example approval button component
import { useState } from 'react';

export function BookingApprovalButton({ bookingId, approvalStatus, onApprovalSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMessage: message })
      });

      if (!response.ok) throw new Error('Approval failed');
      
      const data = await response.json();
      onApprovalSuccess(data);
      setShowDialog(false);
      setMessage('');
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve booking');
    } finally {
      setLoading(false);
    }
  };

  if (approvalStatus === 'approved') {
    return <span className="badge badge-success">✓ Approved</span>;
  }

  return (
    <>
      <button 
        onClick={() => setShowDialog(true)}
        className="btn btn-primary"
      >
        Approve Booking
      </button>

      {showDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Approve Booking #{bookingId}</h3>
            
            <textarea
              placeholder="Optional message to customer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full mt-4"
              rows={3}
            />

            <div className="modal-action">
              <button 
                onClick={() => setShowDialog(false)}
                className="btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'Approving...' : 'Approve & Send Email'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDialog(false)} />
        </div>
      )}
    </>
  );
}
```

## Booking Table Columns to Add

Add these columns to the bookings table display:

```typescript
{
  header: 'Approval Status',
  cell: (booking) => (
    <span className={booking.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}>
      {booking.approvalStatus === 'approved' ? '✓ Approved' : '⏳ Pending'}
    </span>
  )
}
```

## Email That Gets Sent

When admin approves a booking, the customer receives:
- Green-themed confirmation email
- All booking details
- Participant gear sizes
- Admin's optional message
- Preparation instructions
- Next steps

## Database State After Approval

```typescript
{
  id: 123,
  approvalStatus: "pending" // ← Before
  // ...other fields...
}

// After approval call:
{
  id: 123,
  approvalStatus: "approved" // ← After
  updatedAt: "2025-12-03T14:30:00.000Z"
  // ...other fields unchanged...
}
```

## Status Values

```typescript
// approvalStatus field only has two values:
"pending"   // Initial state - waiting for admin approval
"approved"  // Admin has approved and email was sent
```

## Error Scenarios

```typescript
// Booking doesn't exist
GET /bookings/999/approve
→ 404: "Booking not found"

// Invalid request body
POST /bookings/123/approve
Body: { invalid: "field" }
→ 400: Validation error

// Email sending fails (but booking still approved)
POST /bookings/123/approve
→ 200: Booking approved but check logs for email error
→ Console shows: "❌ Email sending failed: [error details]"
```

## Styling Suggestions

```tsx
// Approval status badge
<span className={`badge ${
  booking.approvalStatus === 'approved' 
    ? 'badge-success text-success-content' 
    : 'badge-warning text-warning-content'
}`}>
  {booking.approvalStatus === 'approved' ? '✓ Approved' : '⏳ Pending Approval'}
</span>

// Approve button
<button className="btn btn-sm btn-primary gap-2">
  <CheckCircle size={16} />
  Approve Booking
</button>
```

## Testing the Feature

1. Create a booking via the website
2. Go to admin bookings list
3. Find the booking with `approvalStatus: "pending"`
4. Click the Approve button
5. Add an optional message
6. Click "Approve & Send Email"
7. Verify:
   - Booking status changes to "approved"
   - Customer receives confirmation email
   - Email contains the admin message (if provided)

## Quick Integration Checklist

- [ ] Add `approvalStatus` column to bookings table
- [ ] Add "Approve" button to booking detail page
- [ ] Create approval dialog with message textarea
- [ ] Call `/bookings/:id/approve` endpoint
- [ ] Show success notification
- [ ] Refresh booking list
- [ ] Display approval status badge
- [ ] Test with SMTP configured
- [ ] Test with SMTP disabled (demo mode)

## Troubleshooting

**Email not sending?**
1. Check SMTP env variables are set
2. Check console logs for email error details
3. Booking is still approved even if email fails
4. Check spam/junk folder

**Approval status not updating?**
1. Verify correct booking ID in URL
2. Check API response for errors
3. Ensure correct HTTP method (POST)
4. Check network tab in browser dev tools

**Old booking data showing?**
1. Clear browser cache
2. Refresh the page
3. Check API response headers

## Database Migration

The migration has already been applied:
```sql
ALTER TABLE "Booking" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
```

All existing bookings will have `approvalStatus: 'pending'` by default.
