# ProfitPath - Full-Stack SaaS Application

## Overview

ProfitPath is a comprehensive business intelligence dashboard designed for Amazon FBA sellers. It's a full-stack SaaS application that provides product research, inventory management, sales analytics, and goal tracking capabilities. The application follows a modern monorepo structure with shared types and a clear separation between frontend and backend concerns.

## Recent Changes (July 23, 2025)

✅ **Enhanced Goal Tracking System with Exact Date Precision**: Complete overhaul of goal progress calculation for future-proof tracking
  - **Fixed Date Range Calculation**: Goals now track from exact creation date forward for specified period (30d, 90d, etc.)
  - **Time-Based Status Logic**: Enhanced status calculation considers goal expiration and remaining time (met, unmet, critical, on_track, at_risk, off_track)
  - **Precise Tracking Window**: Each goal has fixed start/end dates preventing data loss from rolling window issues
  - **Enhanced Progress Data**: Added daysRemaining, isExpired, startDate, endDate, and trackingPeriod fields
  - **Future-Proof Design**: New goals created at any time will have accurate isolated tracking periods
  - **Real-time Verification**: Goal ID 7 now correctly shows 10/10 units sold (100% progress) for SKU "HEA-6844"
  - **Status**: Production ready - goal tracking system now provides precise, reliable progress calculation for all future goals

✅ **Comprehensive Bulk Product Management System**: Complete implementation of bulk operations with advanced action toolbar
  - **BulkActionToolbar Component**: Created comprehensive toolbar with bulk edit, delete, category change, and export functionality
  - **Enhanced Inventory Table**: Added checkbox selection system with individual and select-all functionality, highlighted selected rows
  - **Bulk Edit Modal**: Interactive dialog for updating multiple fields across selected items (category, supplier, pricing, reorder points, lead times)
  - **Bulk Delete System**: Confirmation dialog with item preview and safe deletion of multiple inventory items
  - **Category Management**: Quick dropdown to change categories for multiple items simultaneously
  - **CSV Export Function**: Export selected items to CSV with complete inventory data and automatic filename generation
  - **Backend API Endpoints**: Three new bulk operation endpoints (/bulk-edit, /bulk-delete, /bulk-category) with error handling
  - **Visual Feedback**: Orange highlighting for selected rows, selection badges, and real-time action button states
  - **Status**: Production ready - users can now efficiently manage multiple inventory items with professional bulk operations

✅ **Enhanced Flexible CSV Import System with Manual Data Entry**: Complete overhaul of CSV import to accept any format plus manual table data entry
  - **Backend Enhancement**: Enhanced CSV parser with intelligent column name matching (handles variations like "product_name", "Product Name", "name")
  - **Flexible Field Detection**: Auto-detects column variations including normalized matching (removes spaces/punctuation)
  - **Enhanced Import UI**: Added tabbed interface with CSV Upload and Manual Entry options
  - **Manual Data Entry Component**: Created ManualDataEntry component for direct table-based data input with validation
  - **Smart Column Mapping**: Accepts any CSV format - no longer requires exact template matching
  - **Auto-Fill Defaults**: Missing columns are automatically filled with sensible defaults
  - **Extended Field Support**: Enhanced parser supports more field variations (sku/product_sku/code, quantity/qty/units_sold, etc.)
  - **Status**: Production ready - users can now import CSVs in any format or enter data manually through interactive tables

✅ **Critical Sales History List Update Fix - FULLY RESOLVED**: Complete resolution of sales history not updating after sale entry
  - **Root Cause Identified**: /api/sales endpoint (used by Analytics) only creates sales table entries, not sales_history entries
  - **Backend Fix**: Fixed /api/sales endpoint to create both sales and sales_history entries for consistency with manual entry endpoint
  - **API Cleanup**: Removed duplicate /api/sales/history endpoint definitions that were causing routing confusion
  - **Enhanced Logging**: Added comprehensive logging to sales history endpoint with improved SKU filtering capabilities
  - **Frontend Rebuild**: Completely rebuilt SalesHistoryTable component with zero caching (staleTime: 0, cacheTime: 0)
  - **Manual Refresh**: Added functional refresh button with proper loading states and visual feedback
  - **Query Optimization**: Fixed query invalidation patterns for parameterized queries with SKU filters
  - **Real-time Updates**: Sales history table now properly fetches and displays all sales data immediately
  - **Verification**: Tested successfully - HEA-6844 (1 entry), GM-2024-002 (2 entries), empty states working correctly
  - **Status**: Production ready - users can view complete sales history with manual refresh capability

✅ **Removed Walkthrough System (Preserved Welcome Modal)**: Cleaned up onboarding system while maintaining initial welcome experience
  - Removed OnboardingProvider, OnboardingTooltip, OnboardingTrigger, and OnboardingWrapper components
  - Eliminated data-onboarding attributes and tour functionality from all pages
  - Preserved original WelcomeModal for new user introduction and feature overview
  - Simplified codebase by removing complex guided tour system
  - Maintained clean user onboarding through welcome modal without intrusive tooltips
  - Status: Clean implementation - users see welcome modal on first login, then have full access to features

✅ **Complete Functional Report Builder MVP with Action Buttons Implementation**: Full-featured drag-and-drop report system
  - Fixed critical missing 'type' field error that prevented report saving with intelligent auto-type detection
  - Enhanced backend API with comprehensive filtering support for report categories (All, Inventory, Sales, Finance, Goals, Custom)
  - Added dropdown filter interface allowing users to organize and view reports by specific types
  - Implemented fully functional action buttons: Preview (modal viewer), Download PDF (html2pdf.js), Export CSV, Delete
  - Created ReportViewer component with professional report preview showing widgets, metadata, and export options
  - Smart type detection automatically categorizes reports based on widget data sources for better organization
  - Fixed all authentication issues ensuring seamless report operations with proper Firebase token handling
  - Integrated html2pdf.js library for high-quality PDF generation from report canvas elements
  - Enhanced CSV export functionality using existing backend API with proper authentication flow

✅ **Trophy System Database Constraint Fix & Real Goal Tracking Implementation**: Complete resolution of user achievement visibility issues
  - Fixed critical database constraint error in trophy system preventing users from seeing earned achievements
  - Replaced onConflictDoUpdate with proper upsert pattern using select-then-update/insert logic
  - Eliminated "unique or exclusion constraint matching" database errors in trophy progress updates
  - Added unique constraint to userTrophies table schema (trophyId, userId) for proper data integrity
  - Replaced mock data in GoalProgressSection with real API data from /api/goals/with-progress endpoint
  - Connected goal progress tracking to actual sales data and KPIs for authentic progress calculation
  - Enhanced goal progress display with real currentValue, targetValue, and status tracking
  - Fixed dashboard Goals section to show actual created goals instead of placeholder mock metrics
  - Improved goal status badges and progress visualization using real-time calculated percentages
  - Trophy system now properly updates without database conflicts when users achieve milestones

## Previous Changes (July 23, 2025)

✅ **Contextual Tooltips & Calendar Restructuring**: Complete UI enhancement with intelligent guidance system
  - Implemented comprehensive tooltip system with witty inventory management tips throughout interface
  - Removed restock inventory section from inventory detail modal (streamlined to 3-tab interface)
  - Renamed "Advanced Calendar" to "Reorder Calendar" with focused inventory restocking functionality
  - Added date press functionality with descriptions to reorder calendar for detailed event viewing
  - Eliminated all sales calendar functionality from reorder section to prevent confusion
  - Established clear separation: Inventory page = Reorder Calendar only, Analytics page = Sales Calendar only
  - Created InventoryTooltip component with entertaining, educational tips for stock management
  - Enhanced inventory table headers with contextual tooltips for better user guidance
  - Fixed calendar overlapping issues and ensured single calendar per section architecture
  - Improved user experience with hover-based help system and cleaner interface organization

## Previous Changes (July 22, 2025)

✅ **Major Inventory System Overhaul**: Complete enhancement of inventory management capabilities
  - Enhanced InventoryDetailModal with comprehensive inventory management interface
  - Added comprehensive restock functionality with quantity tracking, validation, and notes
  - Created SalesHistoryTable component with revenue, units sold, and profit summaries
  - Built CalendarView component supporting inventory management visualization
  - Enhanced inventory page with advanced calendar management
  - Integrated real sales history data with enhanced inventory detail modals
  - Added comprehensive analytics with stock turn rates, days of supply, and reorder value calculations
  - Created new API endpoints: /sales-history, /calendar-sales, /reorder-calendar with proper authentication
  - Enhanced database schema to support sales history tracking and calendar-based management
  - Improved user experience with tabbed interfaces and real-time inventory updates

## Previous Changes (July 20, 2025)

✅ **Critical Backend Data Isolation Fix**: Resolved cross-user data contamination issue
  - Fixed hardcoded userId = 3 in authentication middleware that was causing all users to see User 3's data
  - Implemented proper Firebase JWT token decoding to extract real user Firebase UID
  - Added dynamic user lookup by firebaseUid to get correct internal user ID for data queries
  - Enhanced authentication middleware with comprehensive logging and error handling
  - All API endpoints now properly isolated per user - User X data never shown to User Y

✅ **Comprehensive Frontend Authentication Race Condition Fix**: Eliminated timing issues
  - Fixed getAuthHeaders() to force fresh Firebase token refresh (no localStorage fallback)
  - Created useAuthReady hook to delay queries until Firebase auth state is ready
  - Updated all useQuery calls to wait for both user && authReady conditions
  - Added comprehensive debugging with useAuthDebug hook for UID mismatch detection
  - Enhanced loading states to show specific authentication progress stages

**Technical Achievement:**
- Complete elimination of cross-user data contamination at both frontend and backend levels
- Frontend: Eliminated race condition where user object became truthy before Firebase token refresh
- Backend: Proper Firebase UID extraction and user isolation in all database queries
- Authentication system now treats each login as completely fresh session with correct data isolation

## Previous Changes (July 19, 2025)

✓ **Complete Real-Time Data Synchronization System**: Comprehensive sales-to-analytics data flow implementation
  - Sales History Analytics component with comprehensive filtering, date ranges, and CSV export
  - Real-time performance recalculation triggers after every sales entry (manual or bulk import)
  - Enhanced sales API with intelligent date range filtering (7d, 30d, 90d, 1y)
  - Analytics button (chart icon) added to every inventory item for direct performance data entry
  - Complete cache invalidation across all related endpoints (Dashboard, Performance, Goals, Inventory)
  - Performance recalculation endpoint for manual metric refresh and data consistency
  - Enhanced Analytics Hub with dedicated Performance Metrics tab showing sales history table

✓ **Intelligent CSV Import Enhancement**: Multi-mode import system with performance integration
  - Three distinct CSV import modes: Products only, Sales only, Mixed data processing
  - Automatic performance metric recalculation after any sales data import
  - Enhanced file upload validation with proper error handling and progress feedback
  - Template download system for each import mode with sample data
  - Real-time inventory level updates synchronized with sales recording across all import methods

✓ **Complete Onboarding Flow Implementation**: Progressive user experience with guided feature unlocking
  - Welcome modal with personalized greeting showing user's journey roadmap
  - Progressive sidebar unlocking - Dashboard, Goals, Performance, Analytics locked until sales data added
  - Onboarding context tracking user progress through Product → Inventory → Sales → Analytics flow
  - Lock icons and tooltips on restricted features explaining unlock requirements
  - Fixed DOM nesting errors in sidebar navigation and accessibility warnings
  - Product Workspace as entry point for new users with clear progression path

✓ **Advanced Features Implementation**: Complete integration of all requested advanced components
  - AdvancedReportBuilder with drag-and-drop functionality and export capabilities in Reports page
  - RealTimeAlerts system integrated into Inventory page for stock monitoring
  - AdvancedReorderCalendar with predictive analytics for inventory management
  - PredictiveAnalytics component with demand forecasting and market insights
  - AchievementSystem with gamification using canvas-confetti celebrations
  - New Analytics hub page with tabs for all advanced analytics features

✓ **Enhanced Page Architecture**: Extended all main pages with advanced functionality
  - Inventory page: 5 tabs including Real-Time Alerts and Advanced Calendar
  - Goals page: Achievement System integration with gamified seller progress
  - Reports page: Complete drag-and-drop report builder with template system
  - New Analytics page: Centralized hub for all AI-powered insights and predictions
  - Proper routing and navigation between all advanced features

✓ **README.md Documentation**: Comprehensive setup guide for local development with clone instructions
  - Complete installation and setup instructions for new developers
  - Environment variable configuration guide with Firebase and database setup
  - Project structure documentation and development guidelines
  - Troubleshooting section for common issues and deployment instructions

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