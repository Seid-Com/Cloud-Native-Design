# CloudArch++ Framework Tool

## Overview

CloudArch++ is a cloud-native architecture design framework that guides architects and engineers through a systematic four-phase process for designing scalable, resilient systems. The tool helps users decompose domains into microservices, configure containerization, set up Kubernetes orchestration with SLO-driven autoscaling, and implement resilience patterns with observability.

The application follows a wizard-style workflow with four distinct phases:
- **Phase A**: Domain-Driven Decomposition (bounded contexts, services)
- **Phase B**: Containerization (Docker configurations, multi-stage builds)
- **Phase C**: Orchestration & Scaling (SLOs, autoscaling, K8s manifests)
- **Phase D**: Resilience & Observability (circuit breakers, retries, metrics, tracing)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: React Context API for project state, TanStack Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful JSON API under /api prefix
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenAI API for architecture recommendations and validation
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations output to /migrations directory
- **Key Entities**: Projects containing bounded contexts, services, container configs, SLO definitions, autoscaling strategies, K8s manifests, resilience patterns, and observability configs

### Project Structure
```
client/           # React frontend application
  src/
    components/   # UI components including phase workspaces
    lib/          # Utilities, hooks, context providers
    pages/        # Route page components
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between frontend and backend
  schema.ts       # Drizzle schema and Zod validation schemas
```

### Design Patterns
- **Phased Wizard Flow**: Progressive disclosure of complexity through four sequential phases
- **Validation-Driven**: Each phase includes validation rules and AI-powered recommendations
- **Code Generation**: Automatic generation of Dockerfiles, K8s manifests, and configuration files
- **Theme Support**: Light/dark mode with CSS custom properties

## External Dependencies

### AI Services
- **OpenAI API**: Used for architecture validation and AI-powered recommendations (requires OPENAI_API_KEY environment variable)

### Database
- **PostgreSQL**: Primary data store (requires DATABASE_URL environment variable)
- **connect-pg-simple**: Session storage for PostgreSQL

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library (configured in components.json)
- **Tailwind CSS**: Utility-first CSS framework

### Key Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **Zod**: Schema validation (integrated with Drizzle via drizzle-zod)
- **Lucide React**: Icon library
- **date-fns**: Date utilities