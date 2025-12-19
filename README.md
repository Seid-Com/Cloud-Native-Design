# Microservices Architecture Design Tool

An AI-powered cloud-native architecture design and recommendation tool that helps architects design scalable microservices, containerize applications, orchestrate with Kubernetes, and implement resilience patterns.

## Features

- **Phase A: Domain Decomposition** - Design microservices with bounded contexts and DDD principles
- **Phase B: Containerization** - Configure Docker containers with best practices
- **Phase C: Orchestration** - Design Kubernetes deployments with SLOs and autoscaling
- **Phase D: Resilience & Observability** - Implement circuit breakers, retries, and monitoring
- **AI-Powered Recommendations** - Get actionable suggestions using OpenAI's GPT-5
- **Validation & Testing** - Validate architecture decisions at each phase
- **Code Generation** - Auto-generate Dockerfiles and Kubernetes manifests

## Prerequisites

- Node.js 20+ (with npm)
- PostgreSQL 14+ (optional - in-memory storage available)
- OpenAI API key (for AI recommendations)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/microservices-architecture-tool.git
cd microservices-architecture-tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (Optional - defaults to in-memory)
# Uncomment these for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/microservices_tool

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000
```

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

### 4. Get Your OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy and paste it into your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

The application will start at:
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:5000/api

## Development Workflow

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Type check TypeScript
npm run check

# Build for production
npm run build

# Run production build
npm start

# Push database schema changes
npm run db:push
```

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components and phase workspaces
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and context
│   │   ├── hooks/         # Custom React hooks
│   │   └── index.css      # Global styles
│   └── index.html         # HTML entry point
│
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes and business logic
│   ├── storage.ts         # Data storage interface
│   ├── db.ts              # Database configuration
│   ├── vite.ts            # Vite integration
│   └── static.ts          # Static file serving
│
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data schemas and validation
│
└── script/                # Build scripts
    └── build.ts           # Production build script
```

## Architecture Overview

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter
- **State Management:** TanStack Query (React Query)
- **UI Components:** shadcn/ui with Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Backend Stack
- **Framework:** Express.js
- **Language:** TypeScript
- **Validation:** Zod
- **AI Integration:** OpenAI SDK
- **Database:** Drizzle ORM (PostgreSQL/In-memory)

### Integrations
- OpenAI GPT-5 for AI recommendations
- PostgreSQL for persistent storage (optional)
- In-memory storage for development

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Recommendations
- `POST /api/recommendations` - Get AI recommendations for a phase
  - Body: `{ project: Project, phase: "A" | "B" | "C" | "D" }`

### Validation
- `POST /api/validate` - Validate architecture at current phase
  - Body: `{ project: Project, phase: "A" | "B" | "C" | "D" }`

### Code Generation
- `POST /api/generate/dockerfile` - Generate Dockerfile
  - Body: `{ containerConfig: ContainerConfig, serviceName: string }`
- `POST /api/generate/k8s-manifest` - Generate Kubernetes manifest
  - Body: `{ manifest: K8sManifest, serviceName: string, containerConfig: ContainerConfig }`

### Case Studies
- `GET /api/case-studies` - Get case study examples

## Database Setup

### Using In-Memory Storage (Default)

No setup required! The application uses in-memory storage by default, perfect for development and testing.

### Using PostgreSQL (Production)

1. Install PostgreSQL 14+
2. Create a database:
   ```bash
   createdb microservices_tool
   ```

3. Set DATABASE_URL in `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/microservices_tool
   ```

4. Push schema:
   ```bash
   npm run db:push
   ```

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Run Production Build

```bash
npm start
```

The app will start on the configured PORT (default: 5000).

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for AI) | OpenAI API key for recommendations |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 5000) |

## Features in Detail

### Phase A: Domain Decomposition
- Define microservices
- Establish bounded contexts
- Analyze service dependencies
- Detect circular dependencies
- Get DDD recommendations

### Phase B: Containerization
- Configure container images
- Set resource limits
- Define health checks
- Optimize build strategies
- Generate production-ready Dockerfiles

### Phase C: Orchestration
- Design Kubernetes deployments
- Define Service Level Objectives (SLOs)
- Configure autoscaling strategies
- Generate deployment manifests
- Set up rolling updates

### Phase D: Resilience & Observability
- Implement circuit breakers
- Configure retry policies
- Set up observability (metrics, logging, tracing)
- Define health check strategies
- Optimize resilience patterns

## Troubleshooting

### Application won't start
- Check Node.js version: `node --version` (should be 20+)
- Verify `.env.local` exists with required variables
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### OpenAI API errors
- Verify `OPENAI_API_KEY` is set correctly in `.env.local`
- Check API key is valid at https://platform.openai.com/api-keys
- Ensure you have API credits available
- AI features require a valid API key - the app starts without it, but recommendations will fail

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format is correct
- Ensure database exists: `createdb microservices_tool`

### Port already in use
- Change PORT in `.env.local` or kill process on port 5000
- Or run: `lsof -ti:5000 | xargs kill -9`

## Testing

The application includes validation endpoints to test your architecture design:

```bash
# Validate Phase A design
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"project": {...}, "phase": "A"}'

# Get AI recommendations
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"project": {...}, "phase": "A"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Performance Tips

1. **Caching:** The application uses React Query for efficient API caching
2. **Lazy Loading:** Components load on demand for better performance
3. **Code Splitting:** Frontend code is split by route
4. **Database Indexes:** PostgreSQL schema includes optimized indexes
5. **API Optimization:** AI requests are debounced to avoid rate limits

## Security Best Practices

- **Never commit `.env.local`** - It's already in `.gitignore`
- **Use environment variables** for all sensitive configuration
- **Validate all inputs** using Zod schemas
- **Keep dependencies updated:** `npm audit` and `npm update`
- **Use HTTPS in production** with a proper SSL certificate
- **Implement authentication** before deploying to production

## Common Use Cases

### Learning Microservices Architecture
Use this tool to understand DDD, service decomposition, and cloud-native patterns.

### Designing Enterprise Systems
Plan large-scale microservices with proper separation of concerns and resilience.

### Kubernetes Preparation
Generate production-ready Kubernetes manifests with best practices.

### Team Collaboration
Share architecture designs and get consistent recommendations across the team.

## Performance Notes

- **Lazy OpenAI Initialization:** API client only initializes when recommendations are requested
- **In-Memory Storage:** Development is fast with no database required
- **React Query Caching:** API responses are cached to reduce requests
- **Vite Development:** Hot module reloading for instant feedback

## License

MIT License - see LICENSE file for details

## Support

- **Documentation:** Check the [Design Guidelines](./design_guidelines.md)
- **Issues:** Report bugs on GitHub Issues
- **Discussions:** Ask questions in GitHub Discussions

## Changelog

### v1.0.0 (Current)
- Initial release with 4 phases
- AI-powered recommendations
- Code generation (Dockerfile, K8s manifests)
- Validation system
- In-memory and PostgreSQL storage

---

**Built with ❤️ for cloud-native architects**
