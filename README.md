# ProfitPath - Business Intelligence SaaS Dashboard

A comprehensive business intelligence dashboard designed for Amazon FBA sellers, built with React, Node.js, and PostgreSQL. ProfitPath provides real-time inventory management, sales analytics, performance monitoring, goal tracking, and reporting tools.

![ProfitPath Dashboard](https://via.placeholder.com/800x400/222831/fd7014?text=ProfitPath+Dashboard)

## Features

- **🔐 Authentication System**: Secure email/password authentication with Firebase
- **📊 Performance Analytics**: Real-time KPI tracking with revenue, profit, and conversion metrics
- **📦 Inventory Management**: Complete stock tracking, reorder alerts, and supplier management
- **🛒 Product Workshop**: Research and validate products before launching to inventory
- **🎯 Goal Tracking**: Set and monitor business objectives with progress visualization
- **📈 Sales Analytics**: CSV bulk import with timestamp-based historical tracking
- **📋 Custom Reports**: Build and export custom business intelligence reports
- **🌙 Dark/Light Mode**: Professional UI with theme switching
- **📱 Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Recharts** for data visualization
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Neon Database
- **Drizzle ORM** for database operations
- **Firebase Auth** for authentication

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for cloning the repository

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/profitpath.git
cd profitpath
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_database_host
PGPORT=5432
PGUSER=your_database_user
PGPASSWORD=your_database_password
PGDATABASE=your_database_name

# Firebase Configuration (for authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### Setting up Firebase Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable Authentication and configure Email/Password sign-in method
3. Add your development domain to authorized domains
4. Get your configuration values from Project Settings > General > Your apps

#### Setting up PostgreSQL Database

You have several options for the database:

**Option 1: Neon Database (Recommended)**
1. Sign up at [Neon](https://neon.tech/)
2. Create a new database
3. Copy the connection string to your `.env` file

**Option 2: Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a new database
3. Update the `.env` variables accordingly

### 4. Database Migration

Push the schema to your database:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Project Structure

```
profitpath/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
├── components.json         # shadcn/ui configuration
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Development Guide

### Adding New Features

1. **Database Changes**: Update schemas in `shared/schema.ts`
2. **API Endpoints**: Add routes in `server/routes.ts`
3. **Database Operations**: Implement in `server/storage.ts`
4. **Frontend Components**: Create in `client/src/components/`
5. **Pages**: Add to `client/src/pages/` and register in `App.tsx`

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Use TailwindCSS for styling
- Implement proper error handling
- Add loading states for async operations

### Key Features Implementation

**Authentication Flow**:
- Firebase handles user authentication
- Custom middleware validates requests
- User profiles stored in PostgreSQL

**Data Flow**:
- TanStack Query manages client-side data
- RESTful API with structured responses
- Real-time updates via query invalidation

**UI/UX**:
- Dark mode by default with light mode toggle
- Professional color scheme (#fd7014 accent)
- Responsive design patterns
- Loading states and error boundaries

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection string
- Firebase configuration
- Any API keys for external services

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or similar static hosting
- **Backend**: Railway, Render, or similar Node.js hosting
- **Database**: Neon, Supabase, or managed PostgreSQL

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Kill processes on ports 5000 and 5173
npx kill-port 5000 5173
```

**Database Connection Issues**:
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible
- Check firewall settings

**Firebase Authentication Issues**:
- Verify your Firebase configuration
- Check authorized domains in Firebase console
- Ensure API keys are valid

**Build Errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure database schema is up to date with `npm run db:push`
4. Check network connectivity for external services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Open an issue in the GitHub repository
- Check the troubleshooting section above
- Review the project documentation in `replit.md`

---

**Built with ❤️ for Amazon FBA sellers seeking better business intelligence.**