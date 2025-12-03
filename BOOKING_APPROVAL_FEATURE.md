# Booking Approval Feature Guide

## Overview
This feature allows admins to approve bookings and automatically send a confirmation email to customers with approval details.

## What Was Added

### 1. Database Schema Update
**File:** `backend/prisma/schema.prisma`

Added a new field to the `Booking` model:
```prisma
approvalStatus String @default("pending")
```

Values:
- `"pending"` - Initial state when booking is created
- `"approved"` - After admin approval

**Migration:** `20251203193731_add_approval_status_to_booking`

### 2. Backend Functions

#### Approval Function
**File:** `backend/src/controllers/bookingController.ts`

Function: `approveBooking(id: number, body: unknown)`

Accepts:
```typescript
{
  adminMessage?: string  // Optional message from admin to customer
}
```

Returns: Updated booking with `approvalStatus: "approved"`

#### Email Function
**File:** `backend/src/controllers/emailController.ts`

Function: `sendApprovalEmail(body: unknown)`

Sends a professional HTML email containing:
- Green-themed approval notification
- Booking confirmation details
- Participant gear sizes (if provided)
- Admin message (if included)
- Next steps and preparation instructions

### 3. API Endpoint

**Route:** `POST /bookings/:id/approve`

**URL Example:**
```
POST http://localhost:3000/bookings/123/approve
```

**Request Body:**
```json
{
  "adminMessage": "Your tour has been approved! Please note that we will provide hot drinks at the meeting point."
}
```

**Response:**
```json
{
  "id": 123,
  "guestId": 1,
  "departureId": 5,
  "participants": 2,
  "totalPrice": 600,
  "status": "confirmed",
  "approvalStatus": "approved",
  "notes": "Date: 2025-12-15, Time: 10:00",
  "createdAt": "2025-12-03T12:00:00.000Z",
  "updatedAt": "2025-12-03T14:30:00.000Z",
  "guestEmail": "customer@example.com",
  "guestName": "John Doe",
  "packageId": 2,
  "participantGearSizes": {...},
  "phone": "+358123456789",
  "bookingDate": "2025-12-15",
  "bookingTime": "10:00",
  "guest": {...},
  "package": {...},
  "participantGear": [...]
}
```

## How to Use

### Via API

1. **Get all pending bookings:**
```bash
GET http://localhost:3000/bookings
```

2. **Get a specific booking:**
```bash
GET http://localhost:3000/bookings/123
```

3. **Approve the booking and send confirmation email:**
```bash
POST http://localhost:3000/bookings/123/approve
Content-Type: application/json

{
  "adminMessage": "Your tour is confirmed! We're looking forward to seeing you."
}
```

### Via Frontend Admin Panel
The admin should be able to:
1. View all bookings with their approval status
2. Click an "Approve" button on each booking
3. Optionally add a message to the customer
4. Confirm the approval (which triggers the API call)

## Email Template Features

The approval email includes:
- ✅ Green gradient header with "Booking Approved!" message
- 📋 Confirmed booking details (date, time, participants, total price)
- 👕 Participant gear sizes (if provided)
- 💬 Custom admin message (if provided)
- 📍 Next steps and preparation instructions
- Professional Ukkis Safaris branding

## Status Fields

### Booking Status
Original status field - indicates general booking state:
- `"confirmed"` - Default state
- `"pending"` - Pending payment/confirmation
- `"cancelled"` - Cancelled booking

### Approval Status (NEW)
New field - indicates admin approval:
- `"pending"` - Awaiting admin approval
- `"approved"` - Admin has approved the booking

## Error Handling

- **Booking Not Found:** Returns 404 error
- **Email Sending Failure:** Logs error but still approves booking (non-blocking)
- **Invalid Request:** Returns validation error from Zod schema

## Configuration

The feature uses environment variables for email:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@ukkissafaris.com
```

## Demo Mode

If SMTP is not configured, the system will:
1. Log the email details to console
2. Return success response
3. Not actually send the email

This is useful for development/testing.

## Next Steps for Frontend

1. Add "Approval Status" column to bookings table
2. Add "Approve" button on booking detail page
3. Create approval confirmation dialog with optional message field
4. Display approval status badge (pending/approved)
5. Show admin message in booking details after approval

## Testing

```bash
# Test approval endpoint
curl -X POST http://localhost:3000/bookings/1/approve \
  -H "Content-Type: application/json" \
  -d '{"adminMessage": "Welcome to Arctic adventure!"}'
```

## File Changes Summary

1. ✅ `backend/prisma/schema.prisma` - Added approvalStatus field
2. ✅ `backend/prisma/migrations/20251203193731_*` - Database migration
3. ✅ `backend/src/controllers/bookingController.ts` - Added approveBooking function
4. ✅ `backend/src/controllers/emailController.ts` - Added sendApprovalEmail function
5. ✅ `backend/src/routes/bookingRoutes.ts` - Added POST /bookings/:id/approve endpoint
