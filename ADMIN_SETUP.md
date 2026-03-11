# Speaking Hub Admin Panel - Setup Guide

## Overview

The admin panel is a modern web-based dashboard for managing course registrations, student information, and website content. It provides:

- User authentication with JWT tokens
- Registration management with status tracking
- Content management for dynamic website text
- CSV export functionality
- Real-time data synchronization with the backend

## Quick Start

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and update these required variables:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/speakinghub

# Admin Credentials (for initial setup)
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password

# Security (generate a strong secret)
JWT_SECRET=your-super-secret-key-change-in-production
```

### 2. Initialize the Database

Run the migration script to create tables and set up the default admin user:

```bash
node scripts/setup-db.js
```

This will:
- Create `admin_users`, `registrations`, and `content_kv` tables
- Create an admin user with credentials from `.env`
- Initialize default content entries

**Output Example:**
```
[DB Setup] Connecting to database...
[DB Setup] Connected successfully
[DB Setup] Creating tables...
[DB Setup] Tables created successfully
[DB Setup] Setting up admin user: myusername
[DB Setup] Admin user setup complete: ID=1, Username=myusername
[DB Setup] Default content initialized
[DB Setup] Database setup completed successfully!
```

### 3. Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on the configured PORT (default: 3000).

### 4. Access the Admin Panel

Open your browser and navigate to:

```
http://localhost:3000/admin/
```

You should see the login page. Enter your admin credentials:
- Username: value from `ADMIN_USERNAME` env
- Password: value from `ADMIN_PASSWORD` env

## Admin Panel Features

### Dashboard

The dashboard displays:
- Total number of registrations
- Count of new registrations
- Count of registrations awaiting review
- Recent registrations table

### Registrations Management

Manage student registrations with the following features:

**View Registrations:**
- Table view of all registrations
- Sortable columns: Name, Phone, Course, Status, Date
- Search functionality by name or phone number

**Edit Registration:**
1. Click "Edit" button on any registration
2. Update status: New, Check, Time, or Not
3. Add or modify notes
4. Save changes

**Export Data:**
- Click "📥 Export CSV" to download all registrations as a CSV file
- Useful for reporting and data analysis

**Status Values:**
- **New**: Newly submitted registration
- **Check**: Awaiting verification/review
- **Time**: Scheduled for enrollment
- **Not**: Rejected or not proceeding

### Content Management

Update website content without touching code:

**Available Fields:**
- **Hero Title**: Main page heading
- **Hero Subtitle**: Secondary heading/tagline
- **Courses Heading**: Courses section title
- **Footer Text**: Footer content

**How to Update:**
1. Navigate to "Content" tab
2. Edit fields as needed
3. Click "💾 Save Changes"
4. Changes are live immediately

## API Endpoints

### Authentication

**POST /api/admin/login**
```json
{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGc..."
}
```

### Registrations

**GET /api/admin/registrations** (JWT required)

Response:
```json
[
  {
    "id": "abc123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "course": "English 101",
    "note": "Follow up next week",
    "status": "check",
    "created_at": "2024-03-11T10:30:00Z"
  }
]
```

**PATCH /api/admin/registrations/:id/status** (JWT required)
```json
{
  "status": "time",
  "note": "Enrollment confirmed"
}
```

### Content

**GET /api/content**

Response:
```json
{
  "hero_title": "Speaking Hub",
  "hero_subtitle": "Master English Communication",
  "courses_heading": "Our Courses",
  "footer_text": "© 2024 Speaking Hub"
}
```

**PATCH /api/admin/content** (JWT required)
```json
{
  "hero_title": "New Title",
  "hero_subtitle": "New Subtitle"
}
```

## Troubleshooting

### Can't connect to database

**Error:** `Missing env: DATABASE_URL`

**Solution:** 
- Ensure `DATABASE_URL` is set in `.env`
- Verify database server is running
- Check connection credentials

### Login fails with "Invalid credentials"

**Error:** Unable to log in

**Solutions:**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- Run `node scripts/setup-db.js` to create/reset admin user
- Check database connection is working

### Admin panel loads but API calls fail

**Error:** API returns 401 Unauthorized

**Solutions:**
- Clear browser localStorage: `localStorage.clear()`
- Log out and log back in
- Check JWT token isn't expired (default: 7 days)
- Verify `JWT_SECRET` is set in `.env`

### CORS errors in browser console

**Error:** `Access-Control-Allow-Origin` header missing

**Solutions:**
- Ensure CORS is properly configured in backend
- If using different domains, update CORS settings in `backend/server.js`
- For local development, same-origin requests should work

## Security Considerations

### Production Deployment

Before deploying to production:

1. **Change all credentials:**
   ```env
   ADMIN_USERNAME=strong_username
   ADMIN_PASSWORD=very_strong_password_with_symbols
   JWT_SECRET=generate_with_openssl_or_crypto_library
   ```

2. **Use HTTPS:**
   - Tokens are transmitted in Authorization headers
   - Always use HTTPS in production

3. **Database Security:**
   - Use strong database passwords
   - Restrict database access to application server only
   - Enable SSL connections to database

4. **Rate Limiting:**
   - Default: 240 requests per minute
   - Adjust `RATE_LIMIT_MAX` if needed

### Best Practices

- ✅ Change default admin password after first login
- ✅ Keep `JWT_SECRET` secure and secret
- ✅ Use environment variables, never hardcode credentials
- ✅ Regularly backup database
- ✅ Monitor admin login activity
- ✅ Update all dependencies regularly

## File Structure

```
/admin/
  ├── index.html       # Admin panel UI
  └── admin.js         # JavaScript logic
/backend/
  ├── server.js        # Main server
  ├── src/
  │   ├── routes/index.js     # API routes
  │   ├── lib/
  │   │   ├── auth.js         # JWT middleware
  │   │   └── schemas.js      # Input validation
  │   └── plugins/
  │       └── db.js           # Database plugin
  └── sql/
      └── schema.sql          # Database schema
/scripts/
  └── setup-db.js      # Database initialization script
```

## Database Schema

### admin_users
- `id` (BIGSERIAL PRIMARY KEY)
- `username` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `created_at` (TIMESTAMPTZ)

### registrations
- `id` (TEXT PRIMARY KEY)
- `first_name` (TEXT NOT NULL)
- `last_name` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `course` (TEXT NOT NULL)
- `note` (TEXT)
- `status` (TEXT DEFAULT 'new')
- `created_at` (TIMESTAMPTZ)
- Indices: `created_at`, `status`

### content_kv
- `key` (TEXT PRIMARY KEY)
- `value` (TEXT NOT NULL)
- `updated_at` (TIMESTAMPTZ)

## Support & Documentation

For more information:
- Backend API documentation: See `/backend/src/routes/index.js`
- Schema details: See `/backend/sql/schema.sql`
- Environment variables: See `.env.example`

## Version History

- **v1.0.0** (2024-03-11)
  - Initial admin panel release
  - JWT authentication
  - Registration management
  - Content management
  - CSV export functionality
