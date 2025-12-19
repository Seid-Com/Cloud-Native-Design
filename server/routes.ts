import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set. Please configure it to use AI features.");
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Project CRUD operations
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Case studies
  app.get("/api/case-studies", async (req, res) => {
    try {
      const caseStudies = await storage.getCaseStudies();
      res.json(caseStudies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  // AI-powered recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { project, phase } = req.body;
      
      if (!project) {
        return res.status(400).json({ error: "Project data is required" });
      }

      const phasePrompts: Record<string, string> = {
        A: `Analyze this microservice architecture for domain-driven design best practices:
           - Services: ${JSON.stringify(project.services)}
           - Bounded Contexts: ${JSON.stringify(project.boundedContexts)}
           
           Identify:
           1. Anti-patterns like chatty services or circular dependencies
           2. Missing bounded contexts
           3. Services that should be merged or split
           4. Communication pattern improvements`,
        
        B: `Analyze these container configurations for best practices:
           - Configurations: ${JSON.stringify(project.containerConfigs)}
           
           Check for:
           1. Security issues (running as root, missing health checks)
           2. Build optimization opportunities
           3. Resource limit recommendations
           4. Base image suggestions`,
        
        C: `Analyze these Kubernetes configurations:
           - SLOs: ${JSON.stringify(project.sloDefinitions)}
           - Autoscaling: ${JSON.stringify(project.autoscalingStrategies)}
           - Manifests: ${JSON.stringify(project.k8sManifests)}
           
           Recommend:
           1. SLO improvements based on service criticality
           2. Autoscaling strategy optimizations
           3. Deployment strategy suggestions
           4. Resource allocation improvements`,
        
        D: `Analyze these resilience and observability configurations:
           - Resilience Patterns: ${JSON.stringify(project.resiliencePatterns)}
           - Observability: ${JSON.stringify(project.observabilityConfigs)}
           
           Suggest:
           1. Missing resilience patterns for service interactions
           2. Observability gaps
           3. Configuration optimizations
           4. Best practice improvements`
      };

      const systemPrompt = `You are a cloud-native architecture expert. Analyze the provided architecture and generate specific, actionable recommendations. 
      
      Return a JSON array of recommendations with this structure:
      {
        "recommendations": [
          {
            "type": "decomposition" | "pattern" | "anti-pattern" | "optimization" | "validation",
            "title": "Short title",
            "description": "Brief description",
            "rationale": "Why this matters",
            "severity": "info" | "warning" | "error",
            "actionable": true | false,
            "suggestedAction": "What to do (if actionable)"
          }
        ]
      }
      
      Provide 3-5 relevant recommendations for the current phase. Be specific and actionable.`;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: phasePrompts[phase] || phasePrompts.A }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const result = JSON.parse(content);
      
      // Add unique IDs to recommendations
      const recommendations = (result.recommendations || []).map((rec: any, index: number) => ({
        ...rec,
        id: `rec-${Date.now()}-${index}`,
      }));

      res.json({ recommendations });
    } catch (error: any) {
      console.error("AI recommendation error:", error);
      res.status(500).json({ 
        error: "Failed to generate recommendations",
        details: error.message 
      });
    }
  });

  // Validation endpoint
  app.post("/api/validate", async (req, res) => {
    try {
      const { project, phase } = req.body;
      
      if (!project) {
        return res.status(400).json({ error: "Project data is required" });
      }

      const validations: any[] = [];
      const generateId = () => `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      switch (phase) {
        case "A":
          // Domain decomposition validations
          if (project.services.length === 0) {
            validations.push({
              id: generateId(),
              phase: "A",
              category: "Services",
              status: "failed",
              message: "No services defined",
              details: "Add at least one microservice to proceed"
            });
          } else {
            validations.push({
              id: generateId(),
              phase: "A",
              category: "Services",
              status: "passed",
              message: `${project.services.length} services defined`
            });
          }

          if (project.boundedContexts.length === 0) {
            validations.push({
              id: generateId(),
              phase: "A",
              category: "Bounded Contexts",
              status: "warning",
              message: "No bounded contexts defined",
              details: "Consider grouping services into bounded contexts for better organization"
            });
          } else {
            validations.push({
              id: generateId(),
              phase: "A",
              category: "Bounded Contexts",
              status: "passed",
              message: `${project.boundedContexts.length} bounded contexts defined`
            });
          }

          // Check for services without bounded contexts
          const orphanServices = project.services.filter((s: any) => !s.boundedContext);
          if (orphanServices.length > 0) {
            validations.push({
              id: generateId(),
              phase: "A",
              category: "Service Assignment",
              status: "warning",
              message: `${orphanServices.length} services not assigned to a bounded context`,
              details: "Assign services to bounded contexts for better domain organization"
            });
          }

          // Check for circular dependencies
          const dependencies = new Set<string>();
          for (const service of project.services) {
            for (const dep of service.dependencies || []) {
              const key = `${service.name}->${dep}`;
              const reverse = `${dep}->${service.name}`;
              if (dependencies.has(reverse)) {
                validations.push({
                  id: generateId(),
                  phase: "A",
                  category: "Dependencies",
                  status: "error",
                  message: `Circular dependency detected: ${service.name} <-> ${dep}`,
                  details: "Consider using async communication or event-driven patterns"
                });
              }
              dependencies.add(key);
            }
          }
          break;

        case "B":
          // Container validations
          const configuredServices = new Set(project.containerConfigs.map((c: any) => c.serviceId));
          const unconfigured = project.services.filter((s: any) => !configuredServices.has(s.id));

          if (unconfigured.length > 0) {
            validations.push({
              id: generateId(),
              phase: "B",
              category: "Configuration",
              status: unconfigured.length === project.services.length ? "failed" : "warning",
              message: `${unconfigured.length} services not containerized`,
              details: `Configure containers for: ${unconfigured.map((s: any) => s.name).join(", ")}`
            });
          } else if (project.containerConfigs.length > 0) {
            validations.push({
              id: generateId(),
              phase: "B",
              category: "Configuration",
              status: "passed",
              message: "All services have container configurations"
            });
          }

          // Check for multi-stage builds
          const singleStage = project.containerConfigs.filter((c: any) => c.buildType === "single-stage");
          if (singleStage.length > 0) {
            validations.push({
              id: generateId(),
              phase: "B",
              category: "Build Optimization",
              status: "info",
              message: `${singleStage.length} services using single-stage builds`,
              details: "Consider multi-stage builds for smaller production images"
            });
          }

          // Check for health checks
          const noHealthCheck = project.containerConfigs.filter((c: any) => !c.healthCheck);
          if (noHealthCheck.length > 0) {
            validations.push({
              id: generateId(),
              phase: "B",
              category: "Health Checks",
              status: "warning",
              message: `${noHealthCheck.length} containers without health checks`,
              details: "Add health checks for better Kubernetes integration"
            });
          }
          break;

        case "C":
          // Orchestration validations
          if (project.k8sManifests.length === 0) {
            validations.push({
              id: generateId(),
              phase: "C",
              category: "Manifests",
              status: "failed",
              message: "No Kubernetes manifests defined",
              details: "Generate deployment manifests to proceed"
            });
          } else {
            validations.push({
              id: generateId(),
              phase: "C",
              category: "Manifests",
              status: "passed",
              message: `${project.k8sManifests.length} Kubernetes manifests configured`
            });
          }

          if (project.sloDefinitions.length === 0) {
            validations.push({
              id: generateId(),
              phase: "C",
              category: "SLOs",
              status: "warning",
              message: "No SLOs defined",
              details: "Define service level objectives to track reliability"
            });
          }

          if (project.autoscalingStrategies.length === 0) {
            validations.push({
              id: generateId(),
              phase: "C",
              category: "Autoscaling",
              status: "info",
              message: "No autoscaling configured",
              details: "Consider adding autoscaling for dynamic workloads"
            });
          }
          break;

        case "D":
          // Resilience validations
          if (project.resiliencePatterns.length === 0) {
            validations.push({
              id: generateId(),
              phase: "D",
              category: "Resilience",
              status: "warning",
              message: "No resilience patterns configured",
              details: "Add circuit breakers and retries for fault tolerance"
            });
          } else {
            validations.push({
              id: generateId(),
              phase: "D",
              category: "Resilience",
              status: "passed",
              message: `${project.resiliencePatterns.length} resilience patterns configured`
            });
          }

          if (project.observabilityConfigs.length === 0) {
            validations.push({
              id: generateId(),
              phase: "D",
              category: "Observability",
              status: "warning",
              message: "No observability configured",
              details: "Add metrics, logging, and tracing for operational visibility"
            });
          } else {
            validations.push({
              id: generateId(),
              phase: "D",
              category: "Observability",
              status: "passed",
              message: `${project.observabilityConfigs.length} observability configurations`
            });
          }
          break;
      }

      res.json({ validations });
    } catch (error) {
      res.status(500).json({ error: "Validation failed" });
    }
  });

  // Generate Dockerfile
  app.post("/api/generate/dockerfile", async (req, res) => {
    try {
      const { containerConfig, serviceName } = req.body;
      
      if (!containerConfig || !serviceName) {
        return res.status(400).json({ error: "Container config and service name are required" });
      }

      const baseImage = containerConfig.baseImage || "node:20-alpine";
      
      let dockerfile: string;
      
      if (containerConfig.buildType === "multi-stage") {
        dockerfile = `# Multi-stage build for ${serviceName}
# Stage 1: Build
FROM ${baseImage} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM ${baseImage.replace("-alpine", "-slim").replace("-slim", "-alpine")}
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

${(containerConfig.environmentVariables || []).map((env: any) => 
  env.isSecret 
    ? `# ${env.key} - Set via secrets management` 
    : `ENV ${env.key}="${env.value}"`
).join('\n')}

${(containerConfig.exposedPorts || []).map((port: number) => `EXPOSE ${port}`).join('\n')}

${containerConfig.healthCheck ? `HEALTHCHECK --interval=${containerConfig.healthCheck.intervalSeconds}s \\
  CMD wget --quiet --tries=1 --spider http://localhost:${containerConfig.healthCheck.port}${containerConfig.healthCheck.path} || exit 1` : ''}

USER node
CMD ["node", "dist/index.js"]`;
      } else {
        dockerfile = `# Single-stage build for ${serviceName}
FROM ${baseImage}
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${(containerConfig.environmentVariables || []).map((env: any) => 
  env.isSecret 
    ? `# ${env.key} - Set via secrets management` 
    : `ENV ${env.key}="${env.value}"`
).join('\n')}

${(containerConfig.exposedPorts || []).map((port: number) => `EXPOSE ${port}`).join('\n')}

${containerConfig.healthCheck ? `HEALTHCHECK --interval=${containerConfig.healthCheck.intervalSeconds}s \\
  CMD wget --quiet --tries=1 --spider http://localhost:${containerConfig.healthCheck.port}${containerConfig.healthCheck.path} || exit 1` : ''}

USER node
CMD ["node", "index.js"]`;
      }

      res.json({ dockerfile });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate Dockerfile" });
    }
  });

  // Generate K8s manifest
  app.post("/api/generate/k8s-manifest", async (req, res) => {
    try {
      const { manifest, serviceName, containerConfig } = req.body;
      
      if (!manifest || !serviceName) {
        return res.status(400).json({ error: "Manifest and service name are required" });
      }

      const labels = { ...(manifest.labels || {}), app: serviceName.toLowerCase() };
      
      const yaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${serviceName.toLowerCase()}
  namespace: ${manifest.namespace || 'default'}
  labels:
${Object.entries(labels).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}
spec:
  replicas: ${manifest.replicas || 3}
  selector:
    matchLabels:
      app: ${serviceName.toLowerCase()}
  strategy:
    type: ${manifest.deploymentStrategy || 'RollingUpdate'}
${manifest.deploymentStrategy === 'RollingUpdate' ? `    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%` : ''}
  template:
    metadata:
      labels:
        app: ${serviceName.toLowerCase()}
    spec:
      containers:
      - name: ${serviceName.toLowerCase()}
        image: ${serviceName.toLowerCase()}:latest
        ports:
        - containerPort: ${containerConfig?.exposedPorts?.[0] || 3000}
        resources:
          requests:
            cpu: ${containerConfig?.resourceLimits?.cpuRequest || '100m'}
            memory: ${containerConfig?.resourceLimits?.memoryRequest || '128Mi'}
          limits:
            cpu: ${containerConfig?.resourceLimits?.cpuLimit || '500m'}
            memory: ${containerConfig?.resourceLimits?.memoryLimit || '512Mi'}
${containerConfig?.healthCheck ? `        livenessProbe:
          httpGet:
            path: ${containerConfig.healthCheck.path}
            port: ${containerConfig.healthCheck.port}
          initialDelaySeconds: 15
          periodSeconds: ${containerConfig.healthCheck.intervalSeconds}
        readinessProbe:
          httpGet:
            path: ${containerConfig.healthCheck.path}
            port: ${containerConfig.healthCheck.port}
          initialDelaySeconds: 5
          periodSeconds: 10` : ''}
---
apiVersion: v1
kind: Service
metadata:
  name: ${serviceName.toLowerCase()}-svc
  namespace: ${manifest.namespace || 'default'}
spec:
  selector:
    app: ${serviceName.toLowerCase()}
  ports:
  - port: 80
    targetPort: ${containerConfig?.exposedPorts?.[0] || 3000}
  type: ClusterIP`;

      res.json({ manifest: yaml });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate Kubernetes manifest" });
    }
  });

  return httpServer;
}
