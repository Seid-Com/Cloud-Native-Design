import { pgTable, text, varchar, jsonb, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Service definition within a bounded context
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  boundedContext: z.string(),
  responsibilities: z.array(z.string()),
  dependencies: z.array(z.string()),
  communicationType: z.enum(["sync", "async", "event-driven"]),
  dataOwnership: z.array(z.string()),
});

export type Service = z.infer<typeof serviceSchema>;

// Bounded context for domain-driven design
export const boundedContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  domainEvents: z.array(z.string()),
  aggregates: z.array(z.string()),
  services: z.array(z.string()),
});

export type BoundedContext = z.infer<typeof boundedContextSchema>;

// Container configuration for Phase B
export const containerConfigSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  baseImage: z.string(),
  buildType: z.enum(["single-stage", "multi-stage"]),
  exposedPorts: z.array(z.number()),
  environmentVariables: z.array(z.object({
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean(),
  })),
  healthCheck: z.object({
    path: z.string(),
    port: z.number(),
    intervalSeconds: z.number(),
  }).optional(),
  resourceLimits: z.object({
    cpuLimit: z.string(),
    memoryLimit: z.string(),
    cpuRequest: z.string(),
    memoryRequest: z.string(),
  }).optional(),
});

export type ContainerConfig = z.infer<typeof containerConfigSchema>;

// SLO definition for Phase C
export const sloDefinitionSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  metric: z.enum(["availability", "latency", "throughput", "error-rate"]),
  target: z.number(),
  unit: z.string(),
  window: z.string(),
});

export type SLODefinition = z.infer<typeof sloDefinitionSchema>;

// Autoscaling strategy
export const autoscalingStrategySchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  type: z.enum(["HPA", "VPA", "KEDA"]),
  minReplicas: z.number(),
  maxReplicas: z.number(),
  targetMetric: z.string(),
  targetValue: z.number(),
});

export type AutoscalingStrategy = z.infer<typeof autoscalingStrategySchema>;

// Kubernetes manifest configuration
export const k8sManifestSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  deploymentStrategy: z.enum(["RollingUpdate", "Recreate", "BlueGreen", "Canary"]),
  replicas: z.number(),
  namespace: z.string(),
  labels: z.record(z.string()),
  annotations: z.record(z.string()).optional(),
});

export type K8sManifest = z.infer<typeof k8sManifestSchema>;

// Resilience patterns for Phase D
export const resiliencePatternSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  type: z.enum(["circuit-breaker", "bulkhead", "retry", "timeout", "rate-limiter"]),
  config: z.record(z.any()),
  enabled: z.boolean(),
});

export type ResiliencePattern = z.infer<typeof resiliencePatternSchema>;

// Observability configuration
export const observabilityConfigSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  metrics: z.object({
    enabled: z.boolean(),
    endpoint: z.string().optional(),
    scrapeInterval: z.string().optional(),
  }),
  logging: z.object({
    enabled: z.boolean(),
    level: z.enum(["debug", "info", "warn", "error"]),
    format: z.enum(["json", "text"]),
  }),
  tracing: z.object({
    enabled: z.boolean(),
    samplingRate: z.number().optional(),
    exporter: z.enum(["jaeger", "zipkin", "otlp"]).optional(),
  }),
});

export type ObservabilityConfig = z.infer<typeof observabilityConfigSchema>;

// Main architecture project
export const architectureProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  currentPhase: z.enum(["A", "B", "C", "D"]),
  boundedContexts: z.array(boundedContextSchema),
  services: z.array(serviceSchema),
  containerConfigs: z.array(containerConfigSchema),
  sloDefinitions: z.array(sloDefinitionSchema),
  autoscalingStrategies: z.array(autoscalingStrategySchema),
  k8sManifests: z.array(k8sManifestSchema),
  resiliencePatterns: z.array(resiliencePatternSchema),
  observabilityConfigs: z.array(observabilityConfigSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ArchitectureProject = z.infer<typeof architectureProjectSchema>;

// Insert schema for creating new projects
export const insertProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;

// AI recommendation response
export const aiRecommendationSchema = z.object({
  id: z.string(),
  type: z.enum(["decomposition", "pattern", "anti-pattern", "optimization", "validation"]),
  title: z.string(),
  description: z.string(),
  rationale: z.string(),
  severity: z.enum(["info", "warning", "error"]),
  actionable: z.boolean(),
  suggestedAction: z.string().optional(),
});

export type AIRecommendation = z.infer<typeof aiRecommendationSchema>;

// Case study metrics
export const caseStudyMetricsSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.enum(["e-commerce", "iot-pipeline"]),
  baseline: z.object({
    p95Latency: z.number(),
    availability: z.number(),
    throughput: z.number(),
    mttr: z.number(),
  }),
  optimized: z.object({
    p95Latency: z.number(),
    availability: z.number(),
    throughput: z.number(),
    mttr: z.number(),
  }),
  improvements: z.object({
    latencyReduction: z.number(),
    availabilityIncrease: z.number(),
    throughputIncrease: z.number(),
    mttrReduction: z.number(),
  }),
});

export type CaseStudyMetrics = z.infer<typeof caseStudyMetricsSchema>;

// Validation result
export const validationResultSchema = z.object({
  id: z.string(),
  phase: z.enum(["A", "B", "C", "D"]),
  category: z.string(),
  status: z.enum(["passed", "warning", "failed"]),
  message: z.string(),
  details: z.string().optional(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;

// Projects table for database persistence
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currentPhase: varchar("current_phase", { length: 1 }).notNull().default("A"),
  boundedContexts: jsonb("bounded_contexts").notNull().default([]),
  services: jsonb("services").notNull().default([]),
  containerConfigs: jsonb("container_configs").notNull().default([]),
  sloDefinitions: jsonb("slo_definitions").notNull().default([]),
  autoscalingStrategies: jsonb("autoscaling_strategies").notNull().default([]),
  k8sManifests: jsonb("k8s_manifests").notNull().default([]),
  resiliencePatterns: jsonb("resilience_patterns").notNull().default([]),
  observabilityConfigs: jsonb("observability_configs").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dbInsertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
});

export type DbProject = typeof projects.$inferSelect;

// Legacy user table (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
