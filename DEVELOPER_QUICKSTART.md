# Snowmobile Rental Approval - Developer Quick Start

## What's Been Built

A complete approval workflow for snowmobile rentals with automated emails:

```
Rental Creation (Request Email) → Admin Approval/Rejection → Response Email
```

## How It Works

### 1. Customer Creates Rental
```javascript
// POST /api/snowmobile-rentals
{
  snowmobileId: 1,
  guestEmail: "customer@example.com",
  guestName: "John Doe",
  startTime: "2025-12-16T10:00:00Z",
  endTime: "2025-12-16T12:00:00Z",
  totalPrice: 100
}

// AUTOMATIC: Request email sent to customer
// Response includes: { approvalStatus: "pending" }
```

### 2. Admin Reviews in Dashboard
```javascript
// GET /api/reservations
// Returns all snowmobile rentals with approval status
[
  {
    id: 1,
    guest: { name: "John Doe", email: "..." },
    snowmobile: { name: "mmm", ... },
    startTime: "2025-12-16T10:00:00Z",
    endTime: "2025-12-16T12:00:00Z",
    totalPrice: 100,
    approvalStatus: "pending",  // NEW
    adminMessage: null,          // NEW
    rejectionReason: null        // NEW
  }
]
```

### 3a. Admin Approves
```javascript
// POST /api/snowmobile-rentals/1/approve
// Headers: { Authorization: "Bearer {token}" }
{
  adminMessage: "Welcome! Please arrive 15 minutes early."
}

// AUTOMATIC: Approval email sent to customer
// Response includes: { approvalStatus: "approved" }
```

### 3b. Admin Rejects
```javascript
// POST /api/snowmobile-rentals/1/reject
// Headers: { Authorization: "Bearer {token}" }
{
  rejectionReason: "Snowmobile not available for selected date"
}

// AUTOMATIC: Rejection email sent to customer
// Response includes: { approvalStatus: "rejected" }
```

## Email Workflow

### When Customer Creates Rental:
```
sendSnowmobileRentalRequestEmail({
  email: "customer@example.com",
  name: "John Doe",
  snowmobileName: "mmm",
  date: "December 16, 2025",
  startTime: "10:00",
  endTime: "12:00",
  total: 100,
  rentalId: "1"
})
```
→ Sends: "⏳ Snowmobile Rental Request Received"

### When Admin Approves:
```
sendSnowmobileRentalApprovalEmail({
  email: "customer@example.com",
  name: "John Doe",
  snowmobileName: "mmm",
  date: "December 16, 2025",
  startTime: "10:00",
  endTime: "12:00",
  total: 100,
  rentalId: "1",
  adminMessage: "Welcome!" // Optional
})
```
→ Sends: "✅ Your Snowmobile Rental Approved"

### When Admin Rejects:
```
sendSnowmobileRentalRejectionEmail({
  email: "customer@example.com",
  name: "John Doe",
  snowmobileName: "mmm",
  rentalId: "1",
  rejectionReason: "Not available"
})
```
→ Sends: "⚠️ Rental Status Update"

## Database Schema

```prisma
model SnowmobileRental {
  id               Int        @id
  snowmobileId     Int
  guestId          Int
  startTime        DateTime
  endTime          DateTime
  totalPrice       Decimal
  status           String     @default("pending")
  notes            String?
  
  // NEW FIELDS FOR APPROVAL
  approvalStatus   String     @default("pending")    // pending | approved | rejected
  adminMessage     String?                           // Admin's message on approval
  rejectionReason  String?                           // Admin's reason on rejection
  
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  guest            Guest      @relation(...)
  snowmobile       Snowmobile @relation(...)
}
```

## Code Organization

### File: `emailController.ts`
```typescript
// NEW FUNCTIONS:
export async function sendSnowmobileRentalRequestEmail(body)
export async function sendSnowmobileRentalApprovalEmail(body)
export async function sendSnowmobileRentalRejectionEmail(body)
```

### File: `rentalController.ts`
```typescript
// UPDATED:
export async function createSnowmobileRental(body)
  // Now sends request email automatically

// NEW FUNCTIONS:
export async function approveSnowmobileRental(id, body)
  // Approves and sends approval email
export async function rejectSnowmobileRental(id, body)
  // Rejects and sends rejection email
```

### File: `rentalRoutes.ts`
```typescript
// NEW ROUTES:
POST /api/snowmobile-rentals/:id/approve
POST /api/snowmobile-rentals/:id/reject
```

## Key Implementation Details

### Error Handling
```typescript
// Email failures don't block rental creation/approval
try {
  await sendSnowmobileRentalRequestEmail({...});
} catch (emailError) {
  console.error('Failed to send email:', emailError);
  // Don't throw - rental is still created
}
```

### Time Formatting
```typescript
// Convert dates to readable format for emails
const dateStr = startTime.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
// Output: "December 16, 2025"

const timeStr = startTime.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});
// Output: "10:00"
```

### Email Templates
All templates use responsive HTML with:
- Professional Ukkis Safaris branding
- Color-coded themes (orange/green/red)
- Dynamic content injection
- Mobile-friendly layout
- SMTP fallback to demo mode

## Frontend Integration

Admin dashboard needs to add:

1. **Approval Button**
```javascript
const handleApprove = async (rentalId) => {
  const response = await fetch(`/api/snowmobile-rentals/${rentalId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      adminMessage: optionalWelcomeMessage
    })
  });
  // Refresh list after approval
  fetchReservations();
};
```

2. **Rejection Button**
```javascript
const handleReject = async (rentalId, reason) => {
  const response = await fetch(`/api/snowmobile-rentals/${rentalId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rejectionReason: reason
    })
  });
  // Refresh list after rejection
  fetchReservations();
};
```

3. **Status Display**
```javascript
const statusColor = {
  'pending': 'yellow',
  'approved': 'green',
  'rejected': 'red'
};
```

## Configuration

Ensure `.env` has SMTP settings:
```
SMTP_HOST=your-host.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=noreply@company.com
```

## Testing

### 1. Create Rental
```bash
curl -X POST http://localhost:3001/api/snowmobile-rentals \
  -H "Content-Type: application/json" \
  -d '{
    "snowmobileId": 1,
    "guestEmail": "test@example.com",
    "guestName": "Test User",
    "startTime": "2025-12-16T10:00:00Z",
    "endTime": "2025-12-16T12:00:00Z",
    "totalPrice": 100
  }'
```

### 2. Get All Rentals
```bash
curl http://localhost:3001/api/reservations
```

### 3. Approve Rental (requires admin token)
```bash
curl -X POST http://localhost:3001/api/snowmobile-rentals/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminMessage": "Welcome to Ukkis!"}'
```

### 4. Reject Rental (requires admin token)
```bash
curl -X POST http://localhost:3001/api/snowmobile-rentals/1/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Snowmobile not available"}'
```

## Summary

✅ Backend: Complete
- Approval status fields added to database
- Email functions implemented
- API endpoints created
- Error handling in place

⏳ Frontend: Needs Integration
- Add approve button to admin dashboard
- Add reject dialog
- Display approval status
- Handle form submissions

🎯 Ready for Production
- SMTP configuration required
- Database migration applied
- All logic tested and working
