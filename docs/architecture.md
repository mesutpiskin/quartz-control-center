# Architecture

## Overview

Quartz Control Center follows a **monorepo architecture** with clear separation between frontend and backend applications, along with shared packages for code reuse.

## Project Structure

```
quartz-control-center/
├── apps/                    # Applications
│   ├── api/                # Backend REST API (Node.js/Express)
│   └── web/                # Frontend Web UI (Next.js 14)
├── packages/               # Shared packages
│   └── shared-types/      # Common TypeScript interfaces
├── docker/                 # Docker configurations
│   ├── api/
│   └── web/
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
└── package.json           # Workspace configuration
```

## Technology Stack

### Backend (apps/api)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database Client**: pg (PostgreSQL)
- **Architecture**: Layered (Routes → Services → Database)

### Frontend (apps/web)
- **Framework**: Next.js 14 (App Router)
- **Runtime**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **HTTP Client**: Axios

### Shared (packages/shared-types)
- Common TypeScript interfaces
- Ensures type safety across frontend and backend
- Single source of truth for data models

## Application Architecture

### API (Backend)

```
apps/api/
├── src/
│   ├── db/                # Database connection management
│   │   ├── connectionManager.ts
│   │   └── databaseTypes.ts
│   ├── middleware/        # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validateConnection.ts
│   ├── models/            # Data models
│   │   └── job.model.ts
│   ├── routes/            # API endpoints
│   │   ├── database.ts
│   │   ├── jobs.ts
│   │   ├── triggers.ts
│   │   └── scheduler.ts
│   ├── services/          # Business logic
│   │   ├── schemaService.ts
│   │   └── quartzService.ts
│   └── index.ts           # Express app entry
└── package.json
```

**Key Components:**

1. **Connection Manager**: Dynamic PostgreSQL connection pooling
2. **Schema Service**: Database schema detection and validation
3. **Quartz Service**: Direct SQL queries to Quartz tables
4. **Error Handling**: Centralized error middleware

### Web (Frontend)

```
apps/web/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   │   ├── page.tsx      # Dashboard
│   │   ├── jobs/
│   │   ├── triggers/
│   │   ├── executing/
│   │   ├── scheduler/
│   │   └── settings/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useConnectionProfiles.ts
│   └── lib/              # Utilities
│       ├── api/          # API client
│       └── types/        # Type definitions
└── package.json
```

**Key Components:**

1. **Profile Management**: Multi-database connection profiles
2. **Real-time Monitoring**: Auto-refresh for executing jobs
3. **Premium UI**: Modern, responsive design with dark mode
4. **Type Safety**: Full TypeScript integration

## Data Flow

```
User → Web UI → API Client → Express Routes → Services → PostgreSQL
                                                             ↓
                                                      Quartz Tables
```

### Example: Fetching Jobs

1. User clicks "Jobs" in navigation
2. `jobs/page.tsx` uses `useConnectionProfiles` hook
3. React Query fetches from `/api/jobs/list`
4. API validates connection parameters
5. `quartzService.getAllJobs()` executes SQL query
6. Results returned through Express → React Query → UI

## Database Access Pattern

The application follows a **read-mostly, direct SQL** approach:

- No ORM (direct SQL queries for performance)
- Connection pooling for efficiency
- Dynamic connections (no persistent single database)
- Schema-aware queries

## Security Considerations

### Current Implementation
- Client-side credential storage (localStorage)
- CORS protection
- Input validation

### Production Requirements
- [ ] Server-side session management
- [ ] Encrypted credential storage
- [ ] Authentication layer
- [ ] Role-based access control
- [ ] Audit logging
- [ ] HTTPS/TLS

## Scalability

The monorepo architecture supports:

1. **Horizontal Scaling**: Deploy multiple API instances behind load balancer
2. **Code Sharing**: Shared types prevent duplication
3. **Independent Deployment**: Apps can be deployed separately
4. **Future Services**: Easy to add new services (auth, notifications)

## Deployment Options

### Development
```bash
npm run dev
```

### Production
```bash
# Option 1: Docker Compose
docker-compose up -d

# Option 2: Individual builds
npm run build
npm run api:build
npm run web:build
```

## Monitoring & Observability

**Current**: Console logging

**Recommended additions**:
- Structured logging (Winston, Pino)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- Metrics (Prometheus)
- Distributed tracing (OpenTelemetry)

## Future Enhancements

1. **Microservices Split**
   - Job Service
   - Scheduler Service
   - Auth Service
   - Notification Service

2. **API Gateway**
   - Rate limiting
   - Request routing
   - Authentication

3. **Message Queue**
   - Job execution requests
   - Notifications
   - Async operations

4. **Caching Layer**
   - Redis for frequently accessed data
   - Reduce database load
