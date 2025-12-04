# Snowmobile Rental Approval Workflow

## Overview

This document describes the complete workflow for snowmobile rental requests with admin approval/rejection functionality.

## Workflow Steps

### 1. Customer Creates Rental Request
When a customer creates a snowmobile rental:
- **Endpoint**: `POST /api/snowmobile-rentals`
- **Request Body**:
```json
{
  "snowmobileId": 1,
  "guestEmail": "customer@example.com",
  "guestName": "John Doe",
  "phone": "+358123456789",
  "startTime": "2025-12-16T10:00:00Z",
  "endTime": "2025-12-16T12:00:00Z",
  "totalPrice": 100.00,
  "notes": "Optional notes"
}
```

### 2. Request Email Sent to Customer
When the rental is created successfully:
- **Status**: `approvalStatus: "pending"`
- **Email Sent**: "⏳ Snowmobile Rental Request Received"
- **Email Content**: Includes rental details and informs customer that their request is under review
- **Timeline**: Customer will receive confirmation within 24 hours

### 3. Admin Reviews Request
The admin dashboard displays all pending snowmobile rental requests in the "Single Reservations" tab:
- **Endpoint**: `GET /api/reservations` - Returns all snowmobile rentals

Admin can see:
- Rental ID
- Guest Name & Email
- Snowmobile Details
- Start & End Time
- Total Price
- Current Approval Status
- Created Date

### 4. Admin Approves Rental
Admin can approve a pending rental with optional message:
- **Endpoint**: `POST /api/snowmobile-rentals/:id/approve`
- **Request Body**:
```json
{
  "adminMessage": "Welcome! We're excited to have you. Please arrive 15 minutes early."
}
```
- **Response**: Updated rental with `approvalStatus: "approved"`

### 5. Approval Email Sent to Customer
When admin approves:
- **Email Subject**: "✅ Your Snowmobile Rental Approved"
- **Email Content**:
  - Confirmation header with green theme
  - All rental details
  - Admin message (if provided)
  - Important information and next steps
  - Contact information

### 6. Admin Rejects Rental (Alternative Path)
Admin can reject a pending rental with a reason:
- **Endpoint**: `POST /api/snowmobile-rentals/:id/reject`
- **Request Body**:
```json
{
  "rejectionReason": "The requested snowmobile is not available for the selected date"
}
```
- **Response**: Updated rental with `approvalStatus: "rejected"`

### 7. Rejection Email Sent to Customer
When admin rejects:
- **Email Subject**: "⚠️ Rental Status Update"
- **Email Content**:
  - Rejection notice with red theme
  - Rental information
  - Detailed reason for rejection
  - Alternative options and contact information

## Database Schema

The `SnowmobileRental` model includes:
```prisma
model SnowmobileRental {
  id               Int        @id @default(autoincrement())
  snowmobileId     Int
  guestId          Int
  startTime        DateTime
  endTime          DateTime
  totalPrice       Decimal    @db.Decimal(10, 2)
  status           String     @default("pending")
  notes            String?
  approvalStatus   String     @default("pending")    // NEW
  adminMessage     String?                           // NEW
  rejectionReason  String?                           // NEW
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  guest            Guest      @relation(...)
  snowmobile       Snowmobile @relation(...)
}
```

## Approval Status Values
- `"pending"` - Initial state after customer creates rental
- `"approved"` - Admin has approved the rental
- `"rejected"` - Admin has rejected the rental

## Email Templates

### Request Email
- **Color Theme**: Orange
- **Subject**: "⏳ Snowmobile Rental Request Received"
- **Status**: Awaiting confirmation
- **Timeline**: 24 hours

### Approval Email
- **Color Theme**: Green
- **Subject**: "✅ Your Snowmobile Rental Approved"
- **Next Steps**: Arrival instructions, what to bring, dress code

### Rejection Email
- **Color Theme**: Red
- **Subject**: "⚠️ Rental Status Update"
- **Reason**: Detailed explanation of rejection
- **Options**: How to contact for alternatives

## Admin Routes

All approval endpoints require authentication (Bearer token):

```
POST /api/snowmobile-rentals/:id/approve
  - Approves a rental
  - Requires: adminMessage (optional)
  
POST /api/snowmobile-rentals/:id/reject
  - Rejects a rental
  - Requires: rejectionReason (required)
  
GET /api/reservations
  - Gets all snowmobile rentals
  - Public endpoint (shown in admin dashboard)
```

## Customer Routes

```
POST /api/snowmobile-rentals
  - Create a new rental request
  - Public endpoint
  - Automatically sends request email
  
GET /api/snowmobiles
  - Get available snowmobiles
  - Public endpoint
```

## Implementation Notes

1. **Email Sending**: Emails are sent automatically via SMTP
   - Request email sent immediately on creation
   - Approval/Rejection emails sent when admin takes action
   - Fallback to demo mode if SMTP not configured

2. **Error Handling**: 
   - If email sending fails, the rental/approval is still created
   - Email errors are logged but don't block the process

3. **Authentication**: 
   - Approval endpoints require JWT token in Authorization header
   - Customers don't need auth to create rentals or view snowmobiles

4. **Data Persistence**:
   - All rental data is stored in PostgreSQL
   - All approval decisions are recorded with timestamps

## Testing the Workflow

1. **Create a Rental**:
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

2. **View Rental in Admin**:
```bash
curl http://localhost:3001/api/reservations
```

3. **Approve Rental**:
```bash
curl -X POST http://localhost:3001/api/snowmobile-rentals/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"adminMessage": "Welcome!"}'
```

4. **Reject Rental**:
```bash
curl -X POST http://localhost:3001/api/snowmobile-rentals/1/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Not available"}'
```

## Customization

### Email Templates
Email templates are defined in `backend/src/controllers/emailController.ts`:
- `sendSnowmobileRentalRequestEmail` - Customize request email
- `sendSnowmobileRentalApprovalEmail` - Customize approval email
- `sendSnowmobileRentalRejectionEmail` - Customize rejection email

### Approval Status Values
To add new statuses, update:
1. Email controller schemas
2. Rental controller validation
3. Admin dashboard UI

### Email Configuration
SMTP settings in `.env`:
```
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```
