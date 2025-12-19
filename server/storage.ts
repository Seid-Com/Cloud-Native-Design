import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  projects,
  type ArchitectureProject, 
  type InsertProject,
  type CaseStudyMetrics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getProject(id: string): Promise<ArchitectureProject | undefined>;
  getAllProjects(): Promise<ArchitectureProject[]>;
  createProject(project: InsertProject): Promise<ArchitectureProject>;
  updateProject(id: string, project: Partial<ArchitectureProject>): Promise<ArchitectureProject | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getCaseStudies(): Promise<CaseStudyMetrics[]>;
}

function dbRowToProject(row: any): ArchitectureProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    currentPhase: row.currentPhase as "A" | "B" | "C" | "D",
    boundedContexts: row.boundedContexts as any[] || [],
    services: row.services as any[] || [],
    containerConfigs: row.containerConfigs as any[] || [],
    sloDefinitions: row.sloDefinitions as any[] || [],
    autoscalingStrategies: row.autoscalingStrategies as any[] || [],
    k8sManifests: row.k8sManifests as any[] || [],
    resiliencePatterns: row.resiliencePatterns as any[] || [],
    observabilityConfigs: row.observabilityConfigs as any[] || [],
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

const caseStudies: CaseStudyMetrics[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    domain: "e-commerce",
    baseline: {
      p95Latency: 480,
      availability: 99.2,
      throughput: 1200,
      mttr: 45,
    },
    optimized: {
      p95Latency: 280,
      availability: 99.95,
      throughput: 2768,
      mttr: 15,
    },
    improvements: {
      latencyReduction: 41.7,
      availabilityIncrease: 0.75,
      throughputIncrease: 130.7,
      mttrReduction: 66.7,
    },
  },
  {
    id: "iot-pipeline",
    name: "IoT Data Pipeline",
    domain: "iot-pipeline",
    baseline: {
      p95Latency: 320,
      availability: 99.5,
      throughput: 5000,
      mttr: 30,
    },
    optimized: {
      p95Latency: 120,
      availability: 99.99,
      throughput: 15000,
      mttr: 8,
    },
    improvements: {
      latencyReduction: 62.5,
      availabilityIncrease: 0.49,
      throughputIncrease: 200,
      mttrReduction: 73.3,
    },
  },
];

export class DatabaseStorage implements IStorage {
  async getProject(id: string): Promise<ArchitectureProject | undefined> {
    const [row] = await db.select().from(projects).where(eq(projects.id, id));
    if (!row) return undefined;
    return dbRowToProject(row);
  }

  async getAllProjects(): Promise<ArchitectureProject[]> {
    const rows = await db.select().from(projects);
    return rows.map(dbRowToProject);
  }

  async createProject(insertProject: InsertProject): Promise<ArchitectureProject> {
    const id = randomUUID();
    const now = new Date();
    
    const [row] = await db
      .insert(projects)
      .values({
        id,
        name: insertProject.name,
        description: insertProject.description || "",
        currentPhase: "A",
        boundedContexts: [],
        services: [],
        containerConfigs: [],
        sloDefinitions: [],
        autoscalingStrategies: [],
        k8sManifests: [],
        resiliencePatterns: [],
        observabilityConfigs: [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return dbRowToProject(row);
  }

  async updateProject(id: string, updates: Partial<ArchitectureProject>): Promise<ArchitectureProject | undefined> {
    const existing = await this.getProject(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.currentPhase !== undefined) updateData.currentPhase = updates.currentPhase;
    if (updates.boundedContexts !== undefined) updateData.boundedContexts = updates.boundedContexts;
    if (updates.services !== undefined) updateData.services = updates.services;
    if (updates.containerConfigs !== undefined) updateData.containerConfigs = updates.containerConfigs;
    if (updates.sloDefinitions !== undefined) updateData.sloDefinitions = updates.sloDefinitions;
    if (updates.autoscalingStrategies !== undefined) updateData.autoscalingStrategies = updates.autoscalingStrategies;
    if (updates.k8sManifests !== undefined) updateData.k8sManifests = updates.k8sManifests;
    if (updates.resiliencePatterns !== undefined) updateData.resiliencePatterns = updates.resiliencePatterns;
    if (updates.observabilityConfigs !== undefined) updateData.observabilityConfigs = updates.observabilityConfigs;

    const [row] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    
    if (!row) return undefined;
    return dbRowToProject(row);
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getCaseStudies(): Promise<CaseStudyMetrics[]> {
    return caseStudies;
  }
}

export const storage = new DatabaseStorage();
