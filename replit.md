# ProfitPath - Full-Stack SaaS Application

## Overview

ProfitPath is a comprehensive business intelligence dashboard designed for Amazon FBA sellers. It's a full-stack SaaS application that provides product research, inventory management, sales analytics, and goal tracking capabilities. The application follows a modern monorepo structure with shared types and a clear separation between frontend and backend concerns.

## Recent Changes (July 18, 2025)

✓ **Real Data Integration System**: Complete connection between inventory management and performance analytics
  - Enhanced sales schema with product names, categories, marketplace tracking, and import batch IDs
  - Bulk CSV import functionality specifically for performance sub-page with timestamp-based history
  - Real-time data flow: dashboard and analytics pages now reflect actual inventory data
  - Inventory levels automatically update when sales are recorded (manual or bulk import)
  - Category performance API now pulls from actual sales data with inventory fallback
  - Dashboard KPIs display real metrics from performance API instead of hardcoded values

✓ **CSV Bulk Import System**: Optimized for performance analytics with comprehensive validation
  - SalesImportModal component with three-step process (upload, preview, complete)
  - CSV template download with sample data for proper formatting
  - Real-time preview with import statistics (revenue, units, unique SKUs)
  - Bulk import API endpoint with automatic inventory level updates
  - Import batch tracking for history and audit purposes
  - Error handling and duplicate detection for data integrity

✓ **Product Workshop Sub-Page Fixed**: Resolved all issues and implemented dual-view system
  - Fixed missing variables (activeView, inventoryItems) and proper state management
  - Dual-view toggle between Watchlist Products and Active Inventory
  - Dynamic stats cards that change based on selected view
  - Proper integration with existing product components (AddProductModal, PromoteToInventoryModal)
  - Consistent styling with other sub-pages using exact color specifications

✓ **Performance Sub-Page Implementation**: Complete analytics engine as specified
  - Central analytics dashboard with KPI cards (Revenue, Profit, Units Sold, Conversion Rate)
  - Interactive charts: Revenue & Profit trends (LineChart), Sales by Category (PieChart)
  - Top Products Performance table with ranking, margins, and performance indicators
  - Goal Progress Summary showing active goals with progress bars
  - Date range filtering (7d, 30d, 90d, 1y) with real-time data updates
  - Manual sales entry integration with SalesEntryModal

✓ **Reports Sub-Page Implementation**: Custom business intelligence builder
  - Pre-built report templates: Inventory Snapshot, Sales Performance, Profit Analysis, Goal Tracker
  - Template gallery with category badges and quick-start functionality
  - Report creation modal with template selection and configuration
  - Report management table with view, export (PDF/CSV), and delete functionality
  - Widget system architecture supporting different component types (charts, tables, KPIs, progress)
  - Export capabilities with mutation handling and user feedback
  - Fixed API request issues and proper error handling

✓ **Dashboard Enhancement**: Updated to match specifications with comprehensive real-time overview
  - KPI Cards showing Revenue, Profit, Units Sold, Conversion Rate with trend indicators
  - Inventory Snapshot widget with stock alerts and click-through to inventory page
  - Sales by Category pie chart with real-time category performance data
  - Tracked Products mini-view showing recent watchlist items with status badges
  - Goal Progress Overview with visual progress bars for active goals
  - Recent Sales Trend chart with 7-day rolling data visualization
  - Global date range filtering (7d, 30d, 90d, 1y) affecting all dashboard widgets
  - Click-through navigation to detailed sub-pages (Inventory, Products, Analytics, Goals)

✓ **Backend API Fixes**: Added missing endpoints for analytics and reports functionality
  - Enhanced performance metrics API with date range support
  - Added category performance endpoint for sales breakdown
  - Implemented inventory summary API for dashboard widgets
  - Fixed reports API routes with proper CRUD operations and export functionality
  - Enhanced storage interface with new methods for dashboard data aggregation

✓ **Comprehensive Inventories Sub-Page**: Complete central hub for inventory management
  - Three-tab interface: Overview, Reorder Calendar, and Analytics
  - Real-time inventory metrics with proper calculations (Total SKUs, Total Value, Low Stock, Out of Stock)
  - Advanced filtering system by category and stock status with dynamic filtering
  - Complete InventoryTable component with detailed product information and action buttons
  - InventoryDetailModal for editing stock levels, pricing, and supplier information
  - SalesEntryModal for recording sales with automatic inventory updates and profit calculations
  - InventoryImport component for CSV bulk import with template download and validation
  - ReorderCalendar with visual calendar view and upcoming reorders list with urgency indicators
  - Analytics dashboard showing category breakdowns and inventory insights

✓ **Backend API Enhancement**: Extended inventory management capabilities
  - Enhanced storage methods with getWatchlistProducts filtering
  - Proper separation between watchlist products and active inventory items
  - API routes for inventory CRUD operations, sales entry, and CSV import functionality

✓ **Authentication System Complete**: Implemented full email/password authentication with Firebase
  - Email/password sign-in and sign-up forms with proper validation
  - Password visibility toggle (eye icon) for all password fields
  - Password confirmation validation that must match on sign-up
  - Form validation prevents submission until requirements are met
  - Proper loading states with disabled buttons during authentication
  - User flow correctly redirects to dashboard after successful authentication

✓ **Dashboard KPIs & Analytics**: Built comprehensive business overview dashboard
  - Animated KPI cards showing revenue, units, profit margin, and conversion rate
  - Interactive sales performance chart with Chart.js (daily/weekly/monthly toggle)
  - Real-time inventory alerts showing critical and low stock items
  - Goal progress tracking with visual progress bars and completion percentages
  - What-if scenario simulator with interactive sliders for business strategy testing

✓ **Sidebar Navigation**: Implemented exact design specifications
  - Fixed width at w-60 (240px) with proper sectioning (Main, Analytics, Account)
  - Dark UI design with #222831 background and #fd7014 accent color
  - Functional logout button and proper navigation routing

✓ **Database Setup**: Complete PostgreSQL database with all required tables
  - Users, products, inventory, sales, goals, and reports tables
  - Sample business data populated for testing dashboard functionality
  - Proper Firebase user lookup and database user creation flow

✓ **Products Sub-Page Implementation**: Complete product pipeline management
  - Dual-view system: Watchlist Products (pre-inventory) and Active Inventory
  - Dynamic stats cards showing relevant metrics for each view
  - Proper text visibility in both light and dark modes (white to black switching)
  - Watchlist product cards with status badges (researching, validated, ready to launch)
  - Inventory item cards with stock status and financial details
  - Promote functionality to move products from watchlist to inventory
  - Filtering by category and status with proper state management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: React Context API for global state (Auth, Theme, Inventory)
- **Styling**: TailwindCSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema**: Shared TypeScript schemas using Drizzle and Zod
- **Authentication**: Firebase Auth (with custom middleware)
- **API Design**: RESTful API with structured error handling

### Development Setup
- **Build Tool**: Vite for frontend bundling and development
- **Development Server**: Hot Module Replacement (HMR) enabled
- **Type Checking**: Strict TypeScript configuration
- **Package Manager**: npm with lockfile for dependency management

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: User profiles with Firebase integration
- **Products**: Product watchlist for research and validation
- **Inventory**: Stock management with reorder points and pricing
- **Sales**: Transaction records with profit tracking
- **Goals**: Business objectives with progress tracking
- **Reports**: Custom report definitions

### Authentication System
- Firebase Authentication for user management
- Custom middleware for API route protection
- User profile synchronization between Firebase and internal database
- Session management with header-based user identification

### API Structure
- RESTful endpoints organized by resource type
- Standardized error handling and response formats
- Request validation using Zod schemas
- Query parameter support for filtering and pagination

### UI Theme System
- Dark mode as default with light mode toggle
- CSS custom properties for theme consistency
- Professional color palette with orange accent (#fd7014)
- Responsive design with mobile-first approach

## Data Flow

### Frontend Data Flow
1. User authentication through Firebase
2. TanStack Query manages server state and caching
3. React Context provides global state for auth, theme, and inventory
4. Components fetch data using standardized query hooks
5. Forms submit data through mutation hooks with optimistic updates

### Backend Data Flow
1. Express middleware handles authentication and logging
2. Route handlers validate requests using Zod schemas
3. Storage layer abstracts database operations
4. Drizzle ORM manages database queries and migrations
5. Structured JSON responses with consistent error handling

### Database Operations
- Connection pooling with Neon serverless PostgreSQL
- Type-safe queries using Drizzle ORM
- Shared schema definitions between frontend and backend
- Migration support for schema changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **firebase**: Authentication and user management
- **recharts**: Chart and graph components
- **@radix-ui/***: Accessible UI primitives

### Development Dependencies
- **vite**: Frontend build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation

### External Services
- **Neon Database**: Managed PostgreSQL hosting
- **Firebase**: Authentication and user management
- **Replit**: Development environment and hosting

## Deployment Strategy

### Development Environment
- Replit-based development with integrated tooling
- Hot reload for both frontend and backend changes
- Environment variable management for database and Firebase configuration
- Development-specific error overlays and debugging tools

### Production Considerations
- Frontend builds to static assets using Vite
- Backend compiles to ES modules using esbuild
- Database migrations managed through Drizzle Kit
- Environment-specific configuration for database connections

### Build Process
- `npm run dev`: Development server with HMR
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema synchronization

The application is designed to be scalable and maintainable, with clear separation of concerns and type safety throughout the stack. The architecture supports rapid development while maintaining production-ready code quality.