# GitHub Issue Recommender

## Overview

This is a full-stack web application that recommends GitHub issues to developers based on their skills and preferences. The app fetches GitHub data, stores it in a database, and provides a user-friendly interface for discovering relevant open source contribution opportunities.

**Status**: ✅ Complete and fully functional
- GitHub API integration working with 115+ issues synced
- User profile connection via GitHub username
- Personalized recommendations based on user's programming languages
- Advanced filtering by difficulty, language, and repository size
- Real-time data updates and GitHub-themed responsive UI

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling

The frontend follows a component-based architecture with reusable UI components from shadcn/ui. The styling uses a GitHub-inspired design system with custom CSS variables for theming.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful API with JSON responses
- **Development**: Hot module replacement via Vite middleware

The backend uses a layered architecture with separate concerns for routing, storage, and business logic. It includes GitHub API integration for fetching repository and issue data.

### Database Schema
- **Users**: Stores GitHub user profiles with skills and preferences
- **Repositories**: Caches GitHub repository metadata
- **Issues**: Stores GitHub issues with enhanced metadata for recommendations
- **Schema Management**: Drizzle migrations in PostgreSQL dialect

## Key Components

### Data Layer
- **Storage Interface**: Abstracted storage layer with in-memory and database implementations
- **Schema Validation**: Zod schemas for type-safe data validation
- **Database Connection**: Neon serverless PostgreSQL with connection pooling

### API Layer
- **GitHub Integration**: Fetches users, repositories, and issues from GitHub API
- **Issue Recommendation**: Algorithm-based issue matching using user preferences
- **Data Synchronization**: Background sync of GitHub data with rate limiting

### UI Components
- **Issue Cards**: Displays issue information with difficulty levels and metadata
- **Filtering Sidebar**: Advanced filtering by language, difficulty, and repository size
- **Header**: Search functionality and user profile management
- **Loading States**: Skeleton components for better UX during data fetching

## Data Flow

1. **User Onboarding**: Users enter GitHub username to create profile
2. **Data Sync**: System fetches and caches GitHub data (repos, issues, user info)
3. **Recommendation Engine**: Analyzes user skills and preferences to suggest relevant issues
4. **Filtering**: Users can refine recommendations using sidebar filters
5. **Issue Discovery**: Users browse recommended issues with rich metadata

## External Dependencies

### GitHub API Integration
- **Authentication**: GitHub token-based authentication
- **Rate Limiting**: Respects GitHub API rate limits
- **Data Fetching**: Users, repositories, and issues with full metadata

### Database
- **Provider**: Neon serverless PostgreSQL
- **ORM**: Drizzle with type-safe queries
- **Migrations**: Schema versioning and deployment via Drizzle Kit

### UI Framework
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS with custom design tokens

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with React Fast Refresh
- **Database**: Connection via DATABASE_URL environment variable
- **API Proxy**: Vite proxies API requests to Express server

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: ESBuild bundles Express server with external dependencies
- **Static Assets**: Served from built public directory
- **Process**: Single Node.js process serving both API and static files

### Environment Configuration
- **Database**: PostgreSQL connection string required
- **GitHub API**: Optional GitHub token for higher rate limits
- **Build Output**: Separate client and server bundles in dist directory

The application is designed to be deployed on platforms like Replit, Vercel, or any Node.js hosting service with PostgreSQL database support.

## Recent Changes (January 26, 2025)

✅ **GitHub API Integration**: Successfully configured with GitHub token for higher rate limits and data access
✅ **Issue Synchronization**: 116+ beginner-friendly issues automatically synced from GitHub repositories
✅ **User Profile Connection**: GitHub username-based profile creation with language detection
✅ **TypeScript Fixes**: Resolved all array type handling and query parameter parsing issues
✅ **Frontend Data Loading**: Fixed React Query implementation and API request handling
✅ **Filtering System**: Fully functional sidebar filters for difficulty, language, and repository size
✅ **Responsive UI**: GitHub-themed interface with proper loading states and error handling
✅ **Interactive Onboarding**: 6-step tutorial for new users with progress tracking and skip functionality
✅ **GitHub Disconnect**: Profile dropdown menu with disconnect option and clean data removal

## Key Features Verified Working

1. **Profile Integration**: Users can connect GitHub profiles and get personalized recommendations
2. **Issue Discovery**: Browse 116+ curated beginner-friendly open source issues
3. **Smart Filtering**: Filter by programming language, difficulty level, and repository popularity
4. **Real-time Updates**: Issues sync automatically with fresh data from GitHub API
5. **Responsive Design**: Works seamlessly across desktop and mobile devices
6. **User Onboarding**: Interactive tutorial guides new users through app features
7. **Profile Management**: Easy GitHub connection/disconnection via dropdown menu