# In-Class Gardening Club

A modern web application for managing an in-class gardening club, allowing members to check in on plants, upload photos, and track plant care activities.

## Features

- **User Authentication**: Secure login and registration system
- **Member Dashboard**: Personal dashboard for assigned plants and check-in history
- **Check-in System**: Record plant care activities with notes and photos
- **Admin Panel**: Manage users, plants, and care assignments
- **Email Reminders**: Automated email notifications for plant care tasks
- **Public Plant Gallery**: Allow visitors to browse plants and recent activities
- **Responsive Design**: Optimized for all devices with light and dark mode support

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **File Uploads**: Client-side handling with react-dropzone

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gardening-club.git
cd gardening-club
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email Service
EMAIL_SERVER_USER=your_email_here
EMAIL_SERVER_PASSWORD=your_email_password_here
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@gardeningclub.com
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up Admin User

After starting the application for the first time, you'll need to create an admin user:

1. Register a new user through the registration page
2. Access the SQLite database directly to change the user role:
```bash
npx prisma studio
```
3. Find the user in the User table and change their role to "ADMIN"
4. Save the changes

## Usage

### Member Workflow

1. Log in to your account
2. View assigned plants on the dashboard
3. Click on a plant to check in
4. Add notes and upload a photo of the plant
5. Submit the check-in

### Admin Workflow

1. Log in with an admin account
2. Access the admin panel
3. Manage users, plants, and care assignments
4. Create new plants and assign them to members
5. View all check-in activities

## Email Reminders

The system automatically sends email reminders to members:
- One day before their scheduled plant care
- On the day of scheduled plant care

To trigger email reminders manually, you can access the API endpoint:
```
GET /api/cron/send-reminders
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.