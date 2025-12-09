# Ukkis Snowmobile Safari Reservation System

A comprehensive digital booking platform for Ukkis Hotel, enabling guests to reserve snowmobile safaris and adventure excursions with a full admin management system.

## Project features


- Customer booking system with package selection
- Admin dashboard for managing bookings, packages, and equipment
- Payment processing with Stripe integration
- Email confirmation system
- JWT-based admin authentication
- Real-time availability tracking

## Features

### Customer-Facing
- **Intuitive Booking Interface**: Multi-step reservation process with gear size selection
- **Package Selection**: Browse available snowmobile safari packages
- **Real-time Availability**: Check departure times and equipment availability
- **Secure Payment**: Stripe integration for booking deposits/payments
- **Email Confirmations**: Automated booking confirmation emails

### Admin Dashboard
- **Booking Management**: View, confirm, and manage all bookings
- **Package Management**: Create, edit, and delete safari packages
- **Equipment Management**: Track snowmobiles and assign to departures
- **Contact Messages**: Manage customer inquiries
- **Image Upload**: Upload package images and media

## Tech Stack

### Backend
- Node.js with Fastify
- Prisma ORM with PostgreSQL
- JWT authentication
- Zod validation
- Stripe API integration

### Frontend
- Next.js (React)
- Tailwind CSS
- Shadcn UI components
- React Hook Form with Zod validation
- TypeScript

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm or yarn


### Public
- `POST /api/bookings` - Create a new booking
- `GET /api/packages` - Get available packages
- `GET /api/departures` - Get available departures
- `POST /api/contact` - Submit contact message
- `POST /api/create-payment-intent` - Create Stripe payment intent

### Admin (Requires JWT Token)
- `GET /api/bookings` - Get all bookings
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/packages` - Create package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package
- `GET /api/contact` - Get contact messages
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Register new admin

## Authentication

Admin panel uses JWT token-based authentication. Users must login to access admin features. Tokens are stored in localStorage and sent with protected API requests.

## Known Limitations

- Registration endpoint is public (currently any user can register as admin — implement super-admin role for production)
- Email notifications require SMTP configuration
- Stripe integration requires live API keys for production

## Future Enhancements

- Super-admin role system
- Guide assignment system
- Customer booking history/dashboard
- SMS notifications
- Multi-language support
- Mobile app

## License

Private project for Ukkis Hotel.