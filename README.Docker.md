# Docker Setup for Ukkis Booking System

This guide will help you set up and run the Ukkis Booking System using Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and update it with your actual values:

```bash
cp .env.example .env
```

Edit `.env` and add your:

- Stripe API keys
- Email configuration
- Any other required environment variables

### 2. Build and Start the Containers

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL database on port 5432
- Start the backend API on port 3001
- Start the frontend on port 3000

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## Development Commands

### Start all services

```bash
docker-compose up
```

### Start in detached mode (background)

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clears database)

```bash
docker-compose down -v
```

### View logs

```bash
docker-compose logs -f
```

### View logs for specific service

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild containers after code changes

```bash
docker-compose up --build
```

### Run Prisma commands

```bash
# Generate Prisma Client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Open Prisma Studio
docker-compose exec backend npx prisma studio
```

### Access container shell

```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U ukkis -d ukkis_booking
```

## Production Deployment

For production deployment, update the following:

1. **Environment Variables**: Set production values in `docker-compose.yml` or use a `.env` file
2. **Database**: Use a managed PostgreSQL service or secure your PostgreSQL container
3. **Secrets**: Never commit sensitive data to version control
4. **SSL/TLS**: Configure HTTPS for both frontend and backend
5. **Resource Limits**: Add memory and CPU limits to services

Example production docker-compose additions:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

1. Check if PostgreSQL is healthy:

   ```bash
   docker-compose ps
   ```

2. Verify database logs:
   ```bash
   docker-compose logs postgres
   ```

### Port Already in Use

If you get a "port already in use" error:

1. Check what's using the port:

   ```bash
   # On Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
   ```

2. Either stop that process or change the port in `docker-compose.yml`

### Container Won't Start

1. Check logs:

   ```bash
   docker-compose logs [service-name]
   ```

2. Rebuild without cache:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

### Database Migration Issues

If migrations fail:

1. Access the backend container:

   ```bash
   docker-compose exec backend sh
   ```

2. Run migrations manually:
   ```bash
   npx prisma migrate dev
   ```

## Volumes

The setup uses the following volumes:

- `postgres_data`: Persists PostgreSQL database data
- `./backend/uploads`: Stores uploaded files (mounted as bind mount)

To reset the database completely:

```bash
docker-compose down -v
docker-compose up --build
```

## Network

All services run on a custom bridge network called `ukkis-network`, allowing them to communicate using service names as hostnames.

## Next Steps

1. Configure your Stripe account and add API keys
2. Set up email service (Gmail, SendGrid, etc.)
3. Add seed data to the database
4. Configure SSL certificates for production
5. Set up monitoring and logging
