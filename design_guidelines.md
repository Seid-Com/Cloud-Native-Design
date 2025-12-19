# CloudArch++ Framework Tool - Design Guidelines

## Design Approach

**Selected Approach**: Design System-Based (Linear + Material Design hybrid)

**Justification**: This is a utility-focused, information-dense productivity tool for professional architects and engineers. The application requires exceptional clarity, learnability, and structured information hierarchy. Drawing from Linear's clean, technical aesthetic and Material Design's robust component patterns provides the ideal foundation for complex workflows and data visualization.

**Key Design Principles**:
- Clarity over decoration: Every element serves a functional purpose
- Progressive disclosure: Reveal complexity gradually through phases
- Professional credibility: Academic research tool aesthetics
- Information hierarchy: Clear visual prioritization of critical data

---

## Typography

**Font System** (Google Fonts):
- **Primary**: Inter (400, 500, 600, 700) - Interface, body text, labels
- **Monospace**: JetBrains Mono (400, 500) - Code snippets, technical configurations

**Hierarchy**:
- H1 (Page titles): text-4xl font-bold (36px)
- H2 (Phase headers): text-3xl font-semibold (30px)
- H3 (Section titles): text-2xl font-semibold (24px)
- H4 (Subsections): text-xl font-medium (20px)
- Body: text-base (16px), leading-relaxed
- Small text: text-sm (14px)
- Labels/captions: text-xs font-medium uppercase tracking-wide (12px)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mt-8, space-y-12)

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-6
- Phase wizard: 2-column layout (sidebar navigation + content area)
  - Sidebar: w-64 fixed left panel
  - Content: flex-1 main workspace
- Cards/modules: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Forms: Single column max-w-2xl for optimal readability

**Responsive Breakpoints**:
- Mobile: Stack all columns, collapsible sidebar
- Tablet (md:): 2-column layouts where appropriate
- Desktop (lg:): Full multi-column experience

---

## Component Library

### Navigation & Structure

**Top Navigation Bar**:
- Full-width header with logo, phase indicator, and action buttons
- Height: h-16, sticky positioning
- Contents: Logo (left) | Phase Progress Indicator (center) | Export/Save buttons (right)

**Phase Sidebar** (Wizard Navigation):
- Fixed left panel showing 4 phases with completion status
- Each phase: Icon + Label + Progress indicator
- Active phase: Highlighted with emphasis
- Completed phases: Checkmark indicator
- Future phases: Muted appearance

**Phase Progress Indicator**:
- Horizontal stepper component showing 1→2→3→4
- Visual line connecting phases
- Current phase highlighted, completed phases filled

### Content Components

**Phase Workspace Cards**:
- White cards with subtle border and shadow
- Padding: p-6 to p-8
- Grouped by logical sections with clear headers
- Rounded corners: rounded-lg

**Input Forms**:
- Text inputs: Full-width with clear labels above
- Textareas: For longer content like service descriptions
- Select dropdowns: For bounded context selection, pattern choices
- Checkboxes/Radio: For resilience patterns, deployment strategies
- All inputs: Consistent height (h-10 for inputs, h-12 for buttons)

**Architecture Diagram Workspace**:
- Large canvas area (min-h-96) with zoom/pan controls
- Node-based interface for microservices
- Connection lines showing inter-service communication
- Toolbar with service templates (API Gateway, Database, Cache, etc.)

**Validation Feedback Panel**:
- Persistent panel showing real-time validation
- Green checkmarks for passed validations
- Warning icons for suggestions
- Error states for blocking issues
- Expandable details for each item

**AI Recommendation Cards**:
- Distinct visual treatment (subtle accent background)
- Icon indicating AI-generated content
- Recommendation text + rationale
- Accept/Dismiss actions

**Code/Configuration Blocks**:
- Monospace font with syntax highlighting
- Dark background theme for code
- Copy button in top-right corner
- Line numbers for longer blocks

**Metrics Comparison Tables** (Case Studies):
- Clean data tables with alternating row backgrounds
- Column headers with sorting indicators
- Highlight cells showing improvements (green accents)
- Before/After comparison layout

**Export Modal**:
- Large modal dialog (max-w-4xl)
- Tabs for different export formats (Kubernetes YAML, Dockerfile, Architecture Doc)
- Preview pane + Download buttons
- Checklist of included artifacts

### Interactive Elements

**Primary Buttons**:
- Height: h-12, rounded-lg
- Text: font-medium text-base
- Padding: px-6
- Usage: "Continue to Phase B", "Generate Manifests", "Export Architecture"

**Secondary Buttons**:
- Similar sizing, alternative visual treatment
- Usage: "Save Draft", "Load Example", "Reset"

**Icon Buttons**:
- Size: h-10 w-10, rounded-md
- Usage: Toolbar actions, diagram controls, help tooltips

**Tabs**:
- Horizontal tab group for switching views within phases
- Underline indicator for active tab
- Usage: Different bounded contexts, deployment environments

---

## Animations

**Minimal, purposeful motion**:
- Phase transitions: Smooth slide-in from right (300ms)
- Validation updates: Gentle fade-in for feedback items
- Diagram interactions: Smooth pan/zoom (no jarring jumps)
- Loading states: Subtle pulse for in-progress operations
- NO decorative animations, parallax, or scroll effects

---

## Images

**No hero images** - This is a web application, not a marketing site.

**Diagrams/Illustrations**:
- Architecture diagram canvas: User-generated visual representations
- Phase icons: Simple, minimal icons for each framework phase
- Case study visualizations: Bar charts/graphs showing metrics improvements
- Pattern illustrations: Small icons representing circuit breakers, bulkheads, etc.

All imagery serves functional, explanatory purposes rather than aesthetic ones.

---

## Application-Specific Patterns

**Phase A Workspace**: Domain modeling canvas with bounded context cards, service definition forms, and validation panel

**Phase B Workspace**: Container configuration builder with Dockerfile template selector, multi-stage build options, and best practice recommendations

**Phase C Workspace**: Kubernetes resource planner with SLO definition form, autoscaling strategy selector (HPA, VPA, KEDA), and manifest preview

**Phase D Workspace**: Resilience pattern library (circuit breaker, bulkhead, retry configs) + observability instrumentation templates (metrics, logs, traces)

**Persistent Elements Across Phases**: Top nav, sidebar, validation panel always visible for continuous feedback