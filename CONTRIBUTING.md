# Contributing to Microservices Architecture Design Tool

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/yourusername/microservices-architecture-tool.git
cd microservices-architecture-tool
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Create .env.local for development
cp .env.example .env.local

# Add your OpenAI API key to .env.local
echo "OPENAI_API_KEY=your_key_here" >> .env.local

# Start development server
npm run dev
```

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Message Format

Follow conventional commits:

```
type(scope): short description

Detailed explanation if needed.

Fixes #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc)
- `refactor`: Code reorganization
- `perf`: Performance improvement
- `test`: Testing
- `chore`: Dependencies, build, etc

### Example Commits

```bash
git commit -m "feat(phase-a): add service dependency validation"
git commit -m "fix(ui): correct button alignment in form"
git commit -m "docs: update API documentation"
git commit -m "refactor(storage): extract database logic"
```

## Making Changes

### Code Style

- Use TypeScript (no `any` types)
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused (< 100 lines)

### Before Submitting

```bash
# Type check
npm run check

# Build
npm run build

# Test locally
npm run dev
```

### File Organization

```
client/src/components/
├── phases/          # Phase-specific components
├── ui/              # shadcn components
└── [name].tsx       # Page components

server/
├── routes.ts        # API endpoints
├── storage.ts       # Data access
└── index.ts         # Server setup

shared/
└── schema.ts        # Data schemas
```

## Pull Request Process

### 1. Push Your Changes

```bash
git push origin feature/your-feature
```

### 2. Create Pull Request

On GitHub:
1. Click "New Pull Request"
2. Select your branch
3. Fill in the PR template
4. Submit

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## How to Test
Steps to verify the changes work

## Screenshots
If applicable

## Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] No new warnings
```

### 4. Review Process

- Code review by maintainers
- Address feedback
- Merge once approved

## Reporting Issues

### Bug Reports

Include:
- Clear title
- Description of issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

### Feature Requests

Include:
- Clear title
- Use case
- Proposed solution
- Alternative approaches considered

## Architecture

### Frontend (React)
- Pages in `client/src/pages/`
- Components in `client/src/components/`
- Hooks in `client/src/hooks/`
- Utilities in `client/src/lib/`
- Styling with Tailwind CSS

### Backend (Express)
- API routes in `server/routes.ts`
- Data access in `server/storage.ts`
- Validation with Zod schemas

### Data Model
- Schemas in `shared/schema.ts`
- Types auto-generated from schemas
- Drizzle ORM for database

## Testing

Add tests for new features:

```typescript
// Example test structure
describe('FeatureName', () => {
  it('should do something', () => {
    // Arrange
    
    // Act
    
    // Assert
  });
});
```

## Documentation

Update docs when:
- Adding features
- Changing API
- Modifying configuration
- Fixing bugs (if explanation needed)

## Dependencies

- Discuss major additions in an issue first
- Minimize new dependencies
- Use existing libraries when possible
- Keep dependency versions current

## Performance

Consider:
- Bundle size impact
- Runtime performance
- Database query efficiency
- API response times
- Component re-render optimization

## Accessibility

- Use semantic HTML
- Add alt text to images
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast

## Security

- Never commit secrets
- Validate all inputs
- Sanitize data
- Use environment variables for config
- Keep dependencies updated

## Questions?

- Create a GitHub Discussion
- Open an issue
- Email maintainers
- Check existing documentation

## Licensing

By contributing, you agree your work will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- GitHub contributor list
- Release notes
- Project documentation

---

**Thank you for contributing! Your help makes this project better.**
