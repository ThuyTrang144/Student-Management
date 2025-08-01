# EduTrack - Student Management System

## Overview

EduTrack is a modern web application designed for managing music lesson students, lesson packages, and attendance tracking. Built with React and TypeScript on the frontend, Express.js on the backend, and PostgreSQL with Drizzle ORM for data persistence. The application provides an intuitive dashboard for teachers to manage their student roster, track lesson credits, and mark attendance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod for validation and type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful endpoints with proper HTTP status codes and JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request/response logging middleware for API monitoring

### Data Layer
- **Database**: PostgreSQL for reliable relational data storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Three main entities - Students, Lesson Packages, and Lessons with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema migrations and version control
- **Connection**: Neon Database serverless driver for cloud-hosted PostgreSQL

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema
- **Repository Pattern**: Storage interface abstraction for data access operations
- **Component Composition**: Reusable UI components with props-based customization
- **Form Validation**: Zod schemas for runtime validation and TypeScript type inference

### File Organization
- `/client` - React frontend application with components, pages, and UI library
- `/server` - Express.js backend with routes, storage layer, and middleware
- `/shared` - Common TypeScript types and database schema definitions
- Component-based architecture with clear separation of concerns

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form for frontend development
- **Express.js**: Web framework for Node.js backend API
- **TypeScript**: Type safety across the entire application stack

### Database and ORM
- **PostgreSQL**: Primary database via Neon Database serverless platform
- **Drizzle ORM**: Type-safe ORM with automatic TypeScript type generation
- **Drizzle Kit**: Database migration and schema management tooling

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **shadcn/ui**: Pre-built component library built on top of Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Data Fetching and State Management
- **TanStack Query**: Server state management with caching and synchronization
- **Zod**: Runtime type validation and schema definition

### Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe CSS class composition
- **clsx & tailwind-merge**: Conditional CSS class name utilities