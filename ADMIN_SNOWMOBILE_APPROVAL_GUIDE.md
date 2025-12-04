# Snowmobile Rental Approval - Quick Admin Guide

## What Has Been Implemented

A complete snowmobile rental request and approval workflow with automated emails at each stage.

## The Workflow (Step by Step)

### Step 1️⃣: Customer Creates Rental Request
- Customer fills out snowmobile rental form on the website
- Submits the request with date, time, snowmobile selection
- **Automatic**: Customer receives "⏳ Rental Request Received" email

### Step 2️⃣: Admin Reviews in Dashboard
- Go to Admin Dashboard → "Single Reservations" tab
- View all pending rental requests
- See: Guest name, snowmobile, date/time, price, approval status
- Status shows as "pending"

### Step 3️⃣: Admin Makes a Decision

#### Option A: APPROVE the Rental ✅
1. Click the rental in the admin dashboard
2. Click "Approve" button
3. (Optional) Add a message to the customer
4. Submit
5. **Automatic**: Customer receives "✅ Rental Approved" email with:
   - Green confirmation header
   - All rental details
   - Your optional message
   - Instructions (arrive 15 min early, what to bring, etc.)

#### Option B: REJECT the Rental ❌
1. Click the rental in the admin dashboard
2. Click "Reject" button
3. Enter a reason for rejection (required)
4. Submit
5. **Automatic**: Customer receives "⚠️ Rental Status Update" email with:
   - Red notice header
   - Reason for cancellation
   - Alternative options

## Email Notifications

### Email 1: Request Received (Automatic on customer submission)
- **Subject**: "⏳ Snowmobile Rental Request Received - [Snowmobile Name]"
- **Color**: Orange
- **Purpose**: Confirmation that request was received and is being reviewed
- **Timeline**: "You will receive confirmation within 24 hours"

### Email 2: Approved (Sent when admin clicks Approve)
- **Subject**: "✅ Your Snowmobile Rental Approved - [Snowmobile Name]"
- **Color**: Green
- **Includes**: 
  - Confirmed rental details
  - Admin's optional welcome message
  - Important info: arrival time, what to bring, dress code
  - Contact info for questions

### Email 3: Rejected (Sent when admin clicks Reject)
- **Subject**: "⚠️ Rental Status Update - [Snowmobile Name]"
- **Color**: Red
- **Includes**:
  - Reason for rejection
  - Alternatives: contact for other dates/snowmobiles
  - Contact information

## Admin Dashboard Integration

In the admin panel "Single Reservations" tab, you will see:

| Column | Description |
|--------|-------------|
| ID | Unique rental request ID |
| GUEST | Customer's name |
| SNOWMOBILE | Snowmobile name/model |
| START TIME | Rental start date & time |
| END TIME | Rental end date & time |
| PRICE | Total rental price (€) |
| STATUS | "pending", "approved", or "rejected" |
| CREATED | When the request was submitted |

## Action Buttons

### For Each Rental:
- **Approve Button** → Opens approval dialog (optional: add message)
- **Reject Button** → Opens rejection dialog (required: add reason)
- **View Details** → See full guest info and rental details

## Important Notes

1. **Emails are automatic**: Once you approve or reject, the email is sent immediately
2. **No email configuration needed**: If SMTP is set up in the backend, emails work automatically
3. **Message to customer**: When approving, you can add a personal welcome message
4. **Rejection reason**: When rejecting, you MUST provide a reason (required)
5. **Status tracking**: All approvals/rejections are logged with timestamp

## API Endpoints (For Developers)

### Approve a Rental
```
POST /api/snowmobile-rentals/{rentalId}/approve
Headers: Authorization: Bearer {token}
Body: { "adminMessage": "Optional message" }
```

### Reject a Rental
```
POST /api/snowmobile-rentals/{rentalId}/reject
Headers: Authorization: Bearer {token}
Body: { "rejectionReason": "Your detailed reason" }
```

### View All Rentals
```
GET /api/reservations
```

## Troubleshooting

### Customer hasn't received approval email
- Check that SMTP is configured in `.env`
- Check email spam folder
- Look at backend logs for email errors
- Make sure email address is correct in admin system

### Can't approve/reject rental
- Make sure you're logged in as admin (have valid JWT token)
- Check that the rental ID exists
- Ensure you have admin permissions

### Email shows wrong information
- Double-check the rental details in the database
- Check email template in `emailController.ts`
- Verify time zone settings

## Summary

The system now provides:
- ✅ Automatic request email when customer submits
- ✅ Admin approval interface in dashboard
- ✅ Automatic approval email with optional admin message
- ✅ Automatic rejection email with reason
- ✅ Full audit trail of all decisions

This ensures customers are informed at every step and admins have complete control over the approval process.
