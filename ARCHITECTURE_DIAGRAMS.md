# System Architecture & Flow Diagrams

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         UKKIS BOOKING SYSTEM                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (Next.js)                      │ │
│  │  ┌──────────────────┐         ┌──────────────────────────┐ │ │
│  │  │ Customer Portal  │         │ Admin Dashboard          │ │ │
│  │  │ ├─ Book Safari   │         │ ├─ Manage Bookings      │ │ │
│  │  │ ├─ Rent Snowmob. │◄────────┤ ├─ Manage Rentals       │ │ │
│  │  │ └─ View Status   │         │ ├─ Approve/Reject       │ │ │
│  │  └──────────────────┘         │ └─ View Messages         │ │ │
│  │                                │                          │ │ │
│  │  HTTP/REST APIs ────────────────────────────────────────► │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  BACKEND (Fastify + Express)               │ │
│  │  ┌──────────────────┐    ┌──────────────────────────────┐ │ │
│  │  │ API Routes       │    │ Controllers & Services       │ │ │
│  │  │ ├─ /bookings     │    │ ├─ Booking Logic           │ │ │
│  │  │ ├─ /snowmobiles  │───►│ ├─ Rental Logic            │ │ │
│  │  │ ├─ /reservations │    │ ├─ Email Service           │ │ │
│  │  │ ├─ /admin        │    │ ├─ Payment Logic           │ │ │
│  │  │ └─ /rentals      │    │ └─ Auth & Validation       │ │ │
│  │  └──────────────────┘    └──────────────────────────────┘ │ │
│  │           │                          │                     │ │
│  │           └──────────────┬───────────┘                     │ │
│  │                          │                                │ │
│  │                  Database Access Layer                    │ │
│  │                          │                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          │                                       │
│  ┌──────────────────────┼──────────────────────────────────┐    │
│  │                      ▼                                  │    │
│  │  ┌────────────────────────────┐  ┌──────────────────┐  │    │
│  │  │   PostgreSQL Database      │  │ Email Service    │  │    │
│  │  │ ├─ Users                   │  │ (SMTP)           │  │    │
│  │  │ ├─ Bookings                │  │ ├─ Request Email │  │    │
│  │  │ ├─ Snowmobiles             │◄─┤ ├─ Approval      │  │    │
│  │  │ ├─ Rentals                 │  │ ├─ Rejection     │  │    │
│  │  │ ├─ Guests                  │  │ └─ Confirmations │  │    │
│  │  │ └─ Approvals               │  └──────────────────┘  │    │
│  │  └────────────────────────────┘                        │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Snowmobile Rental Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              SNOWMOBILE RENTAL APPROVAL WORKFLOW                 │
└─────────────────────────────────────────────────────────────────┘

STEP 1: CUSTOMER CREATES RENTAL
═════════════════════════════════════════════════════════════════

                        CUSTOMER SIDE
                             │
                    Fill Rental Form
                    ├─ Select Snowmobile
                    ├─ Choose Date & Time
                    ├─ Enter Contact Info
                    └─ Click Submit
                             │
                             ▼
                    POST /api/snowmobile-rentals
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
            VALIDATION            DATABASE
            ├─ Email valid    ┌──────────────────┐
            ├─ Availability   │ SnowmobileRental │
            ├─ Guest lookup   │ ├─ id: 1         │
            └─ Price ok       │ ├─ status: pend. │
                              │ ├─ approval: pend│
                   CREATE GUEST   │ ├─ message: null│
                   IF NEW         │ └─ reason: null │
                              └──────────────────┘
                                    │
                    ┌───────────────┴─────────────────┐
                    ▼                                 ▼
              SEND EMAIL              RETURN RESPONSE
         sendSnowmobileRental          { rental data,
         RequestEmail()                  approvalStatus: 
                                         "pending" }
                    │
            ┌───────┴────────┐
            ▼                ▼
         CUSTOMER          ADMIN
         Inbox             Notified
            │
            │ Email #1
            │ ⏳ Request Received
            │ Theme: Orange
            │ ├─ Snowmobile name
            │ ├─ Date & time
            │ ├─ Total price
            │ └─ "Review in 24h"
            ▼
        Customer Reads


STEP 2: ADMIN REVIEWS IN DASHBOARD
═════════════════════════════════════════════════════════════════

              ADMIN PORTAL
                   │
           Admin Dashboard
           Single Reservations Tab
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
     List All Rentals    Filter by Status
     with Status          ├─ Pending
     [pending]            ├─ Approved
     [approved]           └─ Rejected
     [rejected]


STEP 3A: ADMIN APPROVES RENTAL ✅
═════════════════════════════════════════════════════════════════

              ADMIN SIDE
                   │
         Admin clicks "Approve"
         Opens approval dialog
                   │
        ┌──────────┴──────────────────┐
        │                             │
    Approve Dialog              Optional:
    ├─ Show rental details       Enter message
    ├─ Confirm action           e.g. "Welcome!
    ├─ Add message (optional)    Please arrive 15
    └─ Submit                    minutes early"
                   │
    POST /api/snowmobile-rentals/1/approve
    {
      "adminMessage": "Welcome! ..."
    }
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    VALIDATE          UPDATE DATABASE
    ├─ Check auth  ┌──────────────────┐
    ├─ Check ID    │ SnowmobileRental │
    └─ Check role  │ ├─ id: 1         │
                   │ ├─ approval:     │
                   │ │   "approved"   │◄── UPDATED
                   │ ├─ message:      │
                   │ │   "Welcome!..."│◄── UPDATED
                   │ └─ reason: null  │
                   └──────────────────┘
                         │
                    SEND EMAIL
              sendSnowmobileRental
              ApprovalEmail()
                         │
                    RESPONSE
                  Return updated
                   rental data


EMAIL #2 SENT TO CUSTOMER
═════════════════════════════════════════════════════════════════

            Customer Inbox
                   │
            Email #2
            ✅ Rental Approved
            Theme: Green
            ├─ Congratulations!
            ├─ Confirmed Details
            │  ├─ Snowmobile
            │  ├─ Date & Time
            │  └─ Price
            ├─ Admin's Message
            │  "Welcome! Please
            │   arrive 15 min
            │   early..."
            ├─ Next Steps
            │  ├─ Bring ID
            │  ├─ Arrive early
            │  ├─ Dress warm
            │  └─ Contact info
            └─ Contact for Q&A
                   │
            Customer reads
            & confirms attendance


STEP 3B: ADMIN REJECTS RENTAL ❌
═════════════════════════════════════════════════════════════════

              ADMIN SIDE
                   │
         Admin clicks "Reject"
         Opens rejection dialog
                   │
        ┌──────────┴──────────────────┐
        │                             │
    Reject Dialog               Required:
    ├─ Show rental details       Enter reason
    ├─ Confirm action           e.g. "Snowmobile
    ├─ Enter reason (required)   not available
    └─ Submit                    for this date"
                   │
    POST /api/snowmobile-rentals/1/reject
    {
      "rejectionReason": "Snowmobile not available..."
    }
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    VALIDATE          UPDATE DATABASE
    ├─ Check auth  ┌──────────────────┐
    ├─ Check ID    │ SnowmobileRental │
    └─ Check role  │ ├─ id: 1         │
                   │ ├─ approval:     │
                   │ │   "rejected"   │◄── UPDATED
                   │ ├─ message: null │
                   │ └─ reason:       │
                   │   "Snowmobile..."│◄── UPDATED
                   └──────────────────┘
                         │
                    SEND EMAIL
              sendSnowmobileRental
              RejectionEmail()
                         │
                    RESPONSE
                  Return updated
                   rental data


EMAIL #3 SENT TO CUSTOMER
═════════════════════════════════════════════════════════════════

            Customer Inbox
                   │
            Email #3
            ⚠️ Rental Not Approved
            Theme: Red
            ├─ Unfortunately...
            ├─ Rental Details
            │  ├─ Snowmobile
            │  └─ Ref ID
            ├─ Reason
            │  "Snowmobile not
            │   available for this
            │   date. We suggest..."
            ├─ Alternatives
            │  ├─ Contact us
            │  ├─ Try other dates
            │  └─ Try other bikes
            └─ Contact info
                   │
            Customer contacts
            for alternatives
```

## Database State Changes

```
┌──────────────────────────────────────────────────────────────┐
│              SNOWMOBILUSERENTAL STATE TRANSITIONS             │
└──────────────────────────────────────────────────────────────┘

                  INITIAL STATE
                  (Customer creates)
                         │
            ┌────────────┴────────────┐
            │ SnowmobileRental        │
            │ {                       │
            │   id: 1,                │
            │   snowmobileId: 1,      │
            │   guestId: 5,           │
            │   startTime: ...,       │
            │   endTime: ...,         │
            │   totalPrice: 100,      │
            │   status: "pending",    │
            │   approvalStatus:       │
            │     "pending",          │◄── NEW
            │   adminMessage: null,   │◄── NEW
            │   rejectionReason: null │◄── NEW
            │   createdAt: ...,       │
            │   updatedAt: ...        │
            │ }                       │
            └───────────┬─────────────┘
                        │
            EMAIL #1 SENT:
            "Request Received"
                        │
        ┌───────────────┴────────────────┐
        │                                │
   SCENARIO A: APPROVED            SCENARIO B: REJECTED
        │                                │
        ▼                                ▼
   POST /approve                    POST /reject
        │                                │
   UPDATE:                          UPDATE:
   approvalStatus→                  approvalStatus→
   "approved"                       "rejected"
   adminMessage→                    rejectionReason→
   "Welcome!..."                    "Not available..."
        │                                │
   EMAIL #2 SENT:               EMAIL #3 SENT:
   "Rental Approved"            "Status Update"
   (Green)                       (Red)
        │                                │
        ▼                                ▼
   Database Record:           Database Record:
   {                           {
     ...                         ...
     approvalStatus:             approvalStatus:
       "approved",               "rejected",
     adminMessage:               rejectionReason:
       "Welcome!..."             "Not available..."
   }                           }


State Flow Summary:
─────────────────────────────────────────────────────────────

pending ──(customer)──► pending (initial)
          (email #1)

pending ──(admin)──► approved (email #2) ✅
                    or
                    rejected (email #3) ❌
```

## API Call Sequence Diagram

```
SEQUENCE: Snowmobile Rental Approval

Customer              Frontend              Backend            Database    Email Service
    │                    │                     │                  │              │
    │  Fill form &       │                     │                  │              │
    │  submit            │                     │                  │              │
    ├───────────────────►│                     │                  │              │
    │                    │  POST /snowmobile-  │                  │              │
    │                    │  rentals            │                  │              │
    │                    ├────────────────────►│                  │              │
    │                    │                     │  Validate        │              │
    │                    │                     ├─►Snowmobile     │              │
    │                    │                     │   availability   │              │
    │                    │                     │                  │              │
    │                    │                     │  Find/Create     │              │
    │                    │                     │  Guest           │              │
    │                    │                     │                  │              │
    │                    │                     │  CREATE Rental   │              │
    │                    │                     ├─────────────────►│              │
    │                    │                     │◄─────────────────┤              │
    │                    │                     │   Return rental  │              │
    │                    │                     │   (pending)      │              │
    │                    │                     │                  │              │
    │                    │                     │  Send Request    │              │
    │                    │                     │  Email           ├─────────────►│
    │                    │                     │                  │  Send email  │
    │                    │                     │                  │              │ │
    │                    │  Return 201         │                  │              │ │
    │                    │◄─────────────────────┤                  │              │ │
    │                    │                     │                  │              │ │
    │  Confirm page      │                     │                  │              │ │
    │◄──────────────────┤                     │                  │              │ │
    │  "Thank you!"      │                     │                  │              │ │
    │                    │                     │                  │              │ │
    │                    │                     │                  │              │ Email sent
    │                    │                     │                  │              │ │
    │                    │◄──────────────────────────────────────────────────────┤
    │                    │  Email delivered to customer inbox     │              │
    │                    │                     │                  │              │


ADMIN APPROVAL FLOW

Admin                  Frontend              Backend            Database    Email Service
    │                    │                     │                  │              │
    │  Navigate to       │                     │                  │              │
    │  Admin Dashboard   │                     │                  │              │
    ├───────────────────►│                     │                  │              │
    │                    │  GET /reservations  │                  │              │
    │                    ├────────────────────►│  Query rentals   │              │
    │                    │                     ├─────────────────►│              │
    │                    │                     │◄─────────────────┤              │
    │                    │◄─────────────────────┤  Return list     │              │
    │  See rentals       │                     │                  │              │
    │◄──────────────────┤                     │                  │              │
    │  Status: pending   │                     │                  │              │
    │                    │                     │                  │              │
    │  Click Approve     │                     │                  │              │
    │  (add message)     │                     │                  │              │
    ├───────────────────►│                     │                  │              │
    │                    │  POST /snowmobile-  │                  │              │
    │                    │  rentals/1/approve  │                  │              │
    │                    │  + adminMessage     │                  │              │
    │                    ├────────────────────►│  Verify admin    │              │
    │                    │                     │  Check JWT token │              │
    │                    │                     │                  │              │
    │                    │                     │  UPDATE rental   │              │
    │                    │                     ├─────────────────►│              │
    │                    │                     │◄─────────────────┤              │
    │                    │                     │  Return updated  │              │
    │                    │                     │  (approved)      │              │
    │                    │                     │                  │              │
    │                    │                     │  Send Approval   │              │
    │                    │                     │  Email           ├─────────────►│
    │                    │                     │                  │  Send email  │
    │                    │  Return 200         │                  │              │ │
    │                    │◄─────────────────────┤                  │              │ │
    │  Updated view      │                     │                  │              │ │
    │  Status: approved  │                     │                  │              │ │
    │◄──────────────────┤                     │                  │              │ Email sent
    │                    │                     │                  │              │ │
    │                    │                     │                  │              │
    │                    │                     │                  │    Approval email
    │                    │                     │                  │    delivered to
    │                    │                     │                  │    customer inbox
```

## Data Model Relationship

```
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└──────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │    Guest     │
    ├──────────────┤
    │ id (PK)      │
    │ email        │───┐
    │ name         │   │ 1:N
    │ phone        │   │
    │ createdAt    │   │
    └──────────────┘   │
                       │
    ┌──────────────────┴─────────────┐
    │                                │
    │      ┌───────────────────────────────┐
    │      │    SnowmobileRental (NEW!)    │
    │      ├───────────────────────────────┤
    │      │ id (PK)                       │
    │      │ snowmobileId (FK)────────┐    │
    │      │ guestId (FK)──────────┐  │    │
    │      │ startTime              │  │    │
    │      │ endTime                │  │    │
    │      │ totalPrice             │  │    │
    │      │ status                 │  │    │
    │      │ notes                  │  │    │
    │      │ approvalStatus (NEW)   │  │    │
    │      │ adminMessage (NEW)     │  │    │
    │      │ rejectionReason (NEW)  │  │    │
    │      │ createdAt              │  │    │
    │      │ updatedAt              │  │    │
    │      └───────────────────────────────┘
    │                                │
    └────────────────────┐           │
                         │           │
    ┌────────────────────┼───┐       │
    │                    │   │       │
    ▼                    ▼   ▼       ▼
┌──────────────┐  ┌────────────────┐
│ Snowmobile   │  │ (Other tables)  │
├──────────────┤  │                │
│ id (PK)      │  │ Admin          │
│ name         │  │ Booking        │
│ model        │  │ SafariPackage  │
│ year         │  │ Departure      │
│ licensePlate │  │                │
│ status       │  │                │
│ createdAt    │  └────────────────┘
│ updatedAt    │
└──────────────┘
```

This comprehensive architecture shows how the snowmobile rental approval system integrates seamlessly with the existing Ukkis booking platform.
