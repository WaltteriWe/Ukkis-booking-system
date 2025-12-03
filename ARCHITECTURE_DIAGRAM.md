# Booking Approval System - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD (Frontend)                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Bookings Table                                          │  │
│  │  ┌─────────────┬──────────────┬───────────────────────┐ │  │
│  │  │ Booking ID  │ Guest Name   │ Approval Status  Btn  │ │  │
│  │  ├─────────────┼──────────────┼───────────────────────┤ │  │
│  │  │ #123        │ John Doe     │ ⏳ Pending  [Approve] │ │  │
│  │  │ #124        │ Jane Smith   │ ✓ Approved          │ │  │
│  │  └─────────────┴──────────────┴───────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Approval Dialog                                         │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Approve Booking #123                            │   │  │
│  │  │                                                  │   │  │
│  │  │ Optional Message:                               │   │  │
│  │  │ ┌──────────────────────────────────────────────┐│   │  │
│  │  │ │ Your tour has been approved!                ││   │  │
│  │  │ │ We look forward to seeing you.             ││   │  │
│  │  │ └──────────────────────────────────────────────┘│   │  │
│  │  │                                                  │   │  │
│  │  │        [Cancel]  [Approve & Send Email]        │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ POST /bookings/:id/approve
         │ { adminMessage: "..." }
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Node.js/Fastify)              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  bookingRoutes.ts                                        │  │
│  │  POST /bookings/:id/approve                             │  │
│  │    ├─ Extract booking ID from URL params                │  │
│  │    ├─ Call approveBooking(id, body)                     │  │
│  │    └─ Return updated booking JSON                       │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  bookingController.ts                                    │  │
│  │  approveBooking(id, body)                               │  │
│  │    ├─ 1. Validate input with Zod schema                 │  │
│  │    ├─ 2. Find booking by ID in database                 │  │
│  │    ├─ 3. Update approvalStatus to "approved"            │  │
│  │    ├─ 4. Call sendApprovalEmail(...)                    │  │
│  │    └─ 5. Return updated booking                         │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DATABASE (PostgreSQL)                                   │  │
│  │                                                          │  │
│  │  Booking Table Update:                                  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ id: 123                                          │  │  │
│  │  │ approvalStatus: \"pending\" → \"approved\"       │  │  │
│  │  │ updatedAt: 2025-12-03T14:30:00Z                 │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL CONTROLLER                             │
│                  emailController.ts                             │
│                                                                   │
│  sendApprovalEmail({                                            │
│    email: \"customer@example.com\",                              │
│    name: \"John Doe\",                                           │
│    tour: \"Arctic Snowmobile Safari\",                           │
│    date: \"2025-12-15\",                                         │
│    time: \"10:00\",                                              │
│    total: 600,                                                  │
│    bookingId: \"123\",                                           │
│    participants: 2,                                             │
│    adminMessage: \"Your tour has been approved!\"                │
│  })                                                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ✅ Validate email input with Zod                        │  │
│  │  ✅ Get SMTP config from environment variables           │  │
│  │  ✅ Create transporter connection                        │  │
│  │  ✅ Build HTML email template with:                      │  │
│  │     • Green gradient header                              │  │
│  │     • Booking details                                    │  │
│  │     • Participant gear info                              │  │
│  │     • Admin message                                      │  │
│  │     • Next steps                                         │  │
│  │  ✅ Send email via SMTP                                  │  │
│  │  ✅ Log success/error to console                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ✅ Email Sent         ⚠️ Email Failed
    to Customer           (but booking approved)
        │                         │
        │                    Log error to
        │                    console/database
        │
        ▼
┌─────────────────────────────────────────┐
│    CUSTOMER EMAIL INBOX                 │
│                                         │
│  From: noreply@ukkissafaris.com        │
│  Subject: ✅ Your booking has been      │
│           approved - Arctic...          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✅ BOOKING APPROVED!           │   │
│  │  Your Arctic Adventure Confirmed│   │
│  │                                 │   │
│  │  Thank you, John Doe!           │   │
│  │  Your booking has been approved │   │
│  │  by our team.                   │   │
│  │                                 │   │
│  │  📋 Booking Details             │   │
│  │  Tour: Arctic Snowmobile Safari │   │
│  │  Date: 2025-12-15               │   │
│  │  Time: 10:00                    │   │
│  │  Participants: 2                │   │
│  │  Total: €600.00                 │   │
│  │  Booking ID: 123                │   │
│  │                                 │   │
│  │  👕 Participant Gear Sizes      │   │
│  │  John Doe                       │   │
│  │  • Overalls: L                  │   │
│  │  • Boots: 42                    │   │
│  │  • Gloves: M                    │   │
│  │  • Helmet: M                    │   │
│  │                                 │   │
│  │  💬 Message from our team:      │   │
│  │  Your tour has been approved!   │   │
│  │  We look forward to seeing you. │   │
│  │                                 │   │
│  │  📍 Next Steps                  │   │
│  │  ✓ Arrive 15 minutes early      │   │
│  │  ✓ Bring your ID                │   │
│  │  ✓ Dress warmly                 │   │
│  │                                 │   │
│  │  Team Ukkis Safaris             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BOOKING LIFECYCLE                                          │
└─────────────────────────────────────────────────────────────┘

1. BOOKING CREATED
   ─────────────────────────────────
   Customer fills form → POST /bookings
   ↓
   Database stores with:
   • status: "confirmed"
   • approvalStatus: "pending" ← NEW

2. PENDING APPROVAL
   ─────────────────────────────────
   Admin sees booking in dashboard
   approvalStatus = "pending" ⏳
   ↓
   Admin clicks [Approve & Send Email]

3. APPROVAL REQUESTED
   ─────────────────────────────────
   Frontend sends:
   POST /bookings/123/approve
   {
     "adminMessage": "Welcome!"
   }

4. BACKEND PROCESSING
   ─────────────────────────────────
   approveBooking() function:
   
   a) Validate request
      ✓ Check adminMessage is string (optional)
      
   b) Fetch booking from DB
      ✓ Get guest email, name, tour details
      ✓ Get participant gear sizes
      
   c) Update database
      approvalStatus: "pending" → "approved"
      updatedAt: new timestamp
      
   d) Send confirmation email
      ✓ Gather booking details
      ✓ Build HTML email
      ✓ Connect to SMTP server
      ✓ Send email
      
   e) Return updated booking
      {
        id: 123,
        approvalStatus: "approved" ✓
        ...
      }

5. EMAIL SENT
   ─────────────────────────────────
   Customer receives:
   Subject: ✅ Your booking has been approved
   
   Content:
   ✓ Confirmation message
   ✓ Booking details
   ✓ Gear sizes
   ✓ Admin message
   ✓ Next steps

6. BOOKING APPROVED
   ─────────────────────────────────
   Final state:
   • status: "confirmed"
   • approvalStatus: "approved" ✓
   • Email sent: Yes ✓
   • Customer notified: Yes ✓
```

## Request/Response Flow

```
REQUEST:
────────────────────────────────────────────────────────────
POST /bookings/123/approve HTTP/1.1
Content-Type: application/json
Authorization: Bearer admin_token

{
  "adminMessage": "Welcome to the Arctic! We're excited to see you."
}


PROCESSING:
────────────────────────────────────────────────────────────
1. Route handler receives request
   ↓
2. Extract booking ID: 123
   ↓
3. Validate body (Zod schema)
   ✓ adminMessage is optional string
   ↓
4. Call approveBooking(123, body)
   ↓
5. Database query: SELECT * FROM Booking WHERE id = 123
   ↓
6. Booking found:
   {
     id: 123,
     guestName: "John Doe",
     guestEmail: "john@example.com",
     ...
     approvalStatus: "pending"
   }
   ↓
7. Update booking in database
   UPDATE Booking SET approvalStatus = 'approved'
   ↓
8. Send approval email
   ✓ Generate HTML
   ✓ Connect SMTP
   ✓ Send mail
   ↓
9. Log success
   ✅ Approval email sent for booking 123


RESPONSE:
────────────────────────────────────────────────────────────
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "guestId": 1,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "packageId": 2,
  "departureId": 5,
  "participants": 2,
  "totalPrice": 600,
  "status": "confirmed",
  "approvalStatus": "approved",          ← UPDATED
  "bookingDate": "2025-12-15",
  "bookingTime": "10:00",
  "phone": "+358123456789",
  "notes": "Date: 2025-12-15, Time: 10:00",
  "createdAt": "2025-12-03T12:00:00Z",
  "updatedAt": "2025-12-03T14:30:00Z",  ← UPDATED
  "guest": { ... },
  "package": { ... },
  "participantGear": [ ... ]
}
```

## State Transitions

```
┌─────────────┐
│  PENDING    │  (Initial state)
│ ⏳ pending   │
└────────┬────┘
         │
         │ Admin clicks Approve
         │ POST /bookings/:id/approve
         ▼
     ┌────────────┐
     │ APPROVED   │ (Final state)
     │ ✅ approved │ Email sent to customer
     └────────────┘
```

## Field Definitions

```
approvalStatus (NEW FIELD)
├─ Type: String
├─ Default: "pending"
├─ Values:
│  ├─ "pending"  = Awaiting admin approval
│  └─ "approved" = Admin approved, email sent
├─ Database: TEXT NOT NULL DEFAULT 'pending'
└─ Used by: Admin dashboard to show approval status

Related field (existing):
status (Different from approvalStatus!)
├─ Type: String
├─ Default: "confirmed"
├─ Values:
│  ├─ "confirmed" = Booking is active
│  ├─ "pending"   = Payment pending
│  └─ "cancelled" = Booking cancelled
└─ Used by: General booking state management
```

## Error Scenarios

```
Scenario 1: Booking Not Found
─────────────────────────────
Request: POST /bookings/999/approve
Process: Database query returns no results
Response: 404 Not Found
{
  "status": 404,
  "error": "Booking not found"
}

Scenario 2: Invalid Request
─────────────────────────────
Request: POST /bookings/123/approve
Body: { invalidField: "value" }
Process: Zod validation fails
Response: 400 Bad Request
{
  "issues": [ ... ]
}

Scenario 3: Email Sending Fails
─────────────────────────────────
Request: POST /bookings/123/approve
Process: SMTP error when sending email
Response: 200 OK (Still approved!)
{
  "id": 123,
  "approvalStatus": "approved",
  "..." : "..."
}
Console: ❌ Failed to send approval email for booking 123: [error]

Scenario 4: Success
─────────────────────────────
Request: POST /bookings/123/approve
Process: All steps succeed
Response: 200 OK
{
  "id": 123,
  "approvalStatus": "approved",
  ...
}
Console: ✅ Approval email sent for booking 123
```

## Database Changes

```
BEFORE Migration:
─────────────────
Booking Table
├─ id
├─ guestId
├─ status ("confirmed")
├─ notes
└─ ... other fields

AFTER Migration:
────────────────
Booking Table
├─ id
├─ guestId
├─ status ("confirmed")
├─ approvalStatus ("pending") ← NEW COLUMN
├─ notes
└─ ... other fields

MIGRATION SQL:
──────────────
ALTER TABLE "Booking" 
ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
```

## Component Relationships

```
bookingRoutes.ts
    │
    ├─ POST /bookings/:id/approve
    │
    ├─ Calls: approveBooking(id, body)
    │
    └─ bookingController.ts
       │
       ├─ Validates input (Zod)
       │
       ├─ Queries database
       │   └─ SELECT FROM Booking WHERE id = ?
       │
       ├─ Updates database
       │   └─ UPDATE Booking SET approvalStatus = 'approved'
       │
       ├─ Calls: sendApprovalEmail(emailData)
       │
       └─ emailController.ts
          │
          ├─ Validates email input (Zod)
          │
          ├─ Gets SMTP config from .env
          │
          ├─ Creates nodemailer transporter
          │
          ├─ Builds HTML email template
          │
          ├─ Sends email via SMTP
          │
          └─ Returns success/error response
```

---

**Implementation Status: ✅ COMPLETE**
- Database: Updated
- Backend: Ready
- API: Available
- Frontend: Ready for integration
