import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { 
  ArchitectureProject, 
  Service, 
  BoundedContext, 
  ContainerConfig,
  SLODefinition,
  AutoscalingStrategy,
  K8sManifest,
  ResiliencePattern,
  ObservabilityConfig,
  ValidationResult,
  AIRecommendation
} from "@shared/schema";

type Phase = "A" | "B" | "C" | "D";

interface ProjectContextType {
  project: ArchitectureProject | null;
  currentPhase: Phase;
  validationResults: ValidationResult[];
  recommendations: AIRecommendation[];
  isLoading: boolean;
  isSaving: boolean;
  isValidating: boolean;
  isGeneratingRecommendations: boolean;
  
  // Project actions
  createProject: (name: string, description?: string) => Promise<void>;
  loadProject: (project: ArchitectureProject) => void;
  resetProject: () => void;
  saveProject: () => Promise<void>;
  
  // Phase navigation
  setPhase: (phase: Phase) => void;
  canAdvanceToPhase: (phase: Phase) => boolean;
  
  // Phase A: Domain Decomposition
  addBoundedContext: (context: BoundedContext) => void;
  updateBoundedContext: (id: string, context: Partial<BoundedContext>) => void;
  removeBoundedContext: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  removeService: (id: string) => void;
  
  // Phase B: Container Configuration
  addContainerConfig: (config: ContainerConfig) => void;
  updateContainerConfig: (id: string, config: Partial<ContainerConfig>) => void;
  removeContainerConfig: (id: string) => void;
  
  // Phase C: Orchestration
  addSLO: (slo: SLODefinition) => void;
  updateSLO: (id: string, slo: Partial<SLODefinition>) => void;
  removeSLO: (id: string) => void;
  addAutoscaling: (strategy: AutoscalingStrategy) => void;
  updateAutoscaling: (id: string, strategy: Partial<AutoscalingStrategy>) => void;
  removeAutoscaling: (id: string) => void;
  addK8sManifest: (manifest: K8sManifest) => void;
  updateK8sManifest: (id: string, manifest: Partial<K8sManifest>) => void;
  removeK8sManifest: (id: string) => void;
  
  // Phase D: Resilience & Observability
  addResiliencePattern: (pattern: ResiliencePattern) => void;
  updateResiliencePattern: (id: string, pattern: Partial<ResiliencePattern>) => void;
  removeResiliencePattern: (id: string) => void;
  addObservabilityConfig: (config: ObservabilityConfig) => void;
  updateObservabilityConfig: (id: string, config: Partial<ObservabilityConfig>) => void;
  removeObservabilityConfig: (id: string) => void;
  
  // Validation & AI
  runValidation: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyProject(name: string, description?: string): ArchitectureProject {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    description: description || "",
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
  };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ArchitectureProject | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>("A");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json() as Promise<ArchitectureProject>;
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: ArchitectureProject) => {
      const response = await apiRequest("PATCH", `/api/projects/${data.id}`, data);
      return response.json() as Promise<ArchitectureProject>;
    },
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (data: { project: ArchitectureProject; phase: string }) => {
      const response = await apiRequest("POST", "/api/validate", data);
      const result = await response.json();
      return result.validations as ValidationResult[];
    },
  });

  // Recommendations mutation
  const recommendationsMutation = useMutation({
    mutationFn: async (data: { project: ArchitectureProject; phase: string }) => {
      const response = await apiRequest("POST", "/api/recommendations", data);
      const result = await response.json();
      return result.recommendations as AIRecommendation[];
    },
  });

  // Auto-save when project changes with debounce
  useEffect(() => {
    if (!project || !pendingSave) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateProjectMutation.mutateAsync(project);
      } catch (error) {
        console.error("Failed to save project:", error);
      } finally {
        setIsSaving(false);
        setPendingSave(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [project, pendingSave]);

  // Run validation when phase changes
  useEffect(() => {
    if (project) {
      runValidation();
    }
  }, [currentPhase, project?.services.length, project?.containerConfigs.length, project?.k8sManifests.length]);

  const updateProjectLocal = useCallback((updates: Partial<ArchitectureProject>) => {
    setProject(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
    });
    setPendingSave(true);
  }, []);

  const createProject = useCallback(async (name: string, description?: string) => {
    setIsLoading(true);
    try {
      const newProject = await createProjectMutation.mutateAsync({ name, description });
      setProject(newProject);
      setCurrentPhase("A");
      setValidationResults([]);
      setRecommendations([]);
    } catch (error) {
      // Fallback to local-only project if backend fails
      const localProject = createEmptyProject(name, description);
      setProject(localProject);
      setCurrentPhase("A");
    } finally {
      setIsLoading(false);
    }
  }, [createProjectMutation]);

  const loadProject = useCallback((proj: ArchitectureProject) => {
    setProject(proj);
    setCurrentPhase(proj.currentPhase);
  }, []);

  const resetProject = useCallback(() => {
    setProject(null);
    setCurrentPhase("A");
    setValidationResults([]);
    setRecommendations([]);
  }, []);

  const saveProject = useCallback(async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      await updateProjectMutation.mutateAsync(project);
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setIsSaving(false);
    }
  }, [project, updateProjectMutation]);

  const setPhase = useCallback((phase: Phase) => {
    setCurrentPhase(phase);
    updateProjectLocal({ currentPhase: phase });
  }, [updateProjectLocal]);

  const canAdvanceToPhase = useCallback((phase: Phase): boolean => {
    if (!project) return false;
    
    switch (phase) {
      case "A":
        return true;
      case "B":
        return project.services.length > 0;
      case "C":
        return project.containerConfigs.length > 0;
      case "D":
        return project.k8sManifests.length > 0;
      default:
        return false;
    }
  }, [project]);

  const runValidation = useCallback(async () => {
    if (!project) return;
    setIsValidating(true);
    try {
      const results = await validateMutation.mutateAsync({ project, phase: currentPhase });
      setValidationResults(results);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  }, [project, currentPhase, validateMutation]);

  const fetchRecommendations = useCallback(async () => {
    if (!project) return;
    setIsGeneratingRecommendations(true);
    try {
      const recs = await recommendationsMutation.mutateAsync({ project, phase: currentPhase });
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }, [project, currentPhase, recommendationsMutation]);

  // Phase A methods
  const addBoundedContext = useCallback((context: BoundedContext) => {
    updateProjectLocal({ 
      boundedContexts: [...(project?.boundedContexts || []), context] 
    });
  }, [project, updateProjectLocal]);

  const updateBoundedContext = useCallback((id: string, updates: Partial<BoundedContext>) => {
    updateProjectLocal({
      boundedContexts: project?.boundedContexts.map(ctx => 
        ctx.id === id ? { ...ctx, ...updates } : ctx
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeBoundedContext = useCallback((id: string) => {
    updateProjectLocal({
      boundedContexts: project?.boundedContexts.filter(ctx => ctx.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  const addService = useCallback((service: Service) => {
    updateProjectLocal({ 
      services: [...(project?.services || []), service] 
    });
  }, [project, updateProjectLocal]);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    updateProjectLocal({
      services: project?.services.map(svc => 
        svc.id === id ? { ...svc, ...updates } : svc
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeService = useCallback((id: string) => {
    updateProjectLocal({
      services: project?.services.filter(svc => svc.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  // Phase B methods
  const addContainerConfig = useCallback((config: ContainerConfig) => {
    updateProjectLocal({ 
      containerConfigs: [...(project?.containerConfigs || []), config] 
    });
  }, [project, updateProjectLocal]);

  const updateContainerConfig = useCallback((id: string, updates: Partial<ContainerConfig>) => {
    updateProjectLocal({
      containerConfigs: project?.containerConfigs.map(cfg => 
        cfg.id === id ? { ...cfg, ...updates } : cfg
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeContainerConfig = useCallback((id: string) => {
    updateProjectLocal({
      containerConfigs: project?.containerConfigs.filter(cfg => cfg.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  // Phase C methods
  const addSLO = useCallback((slo: SLODefinition) => {
    updateProjectLocal({ 
      sloDefinitions: [...(project?.sloDefinitions || []), slo] 
    });
  }, [project, updateProjectLocal]);

  const updateSLO = useCallback((id: string, updates: Partial<SLODefinition>) => {
    updateProjectLocal({
      sloDefinitions: project?.sloDefinitions.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeSLO = useCallback((id: string) => {
    updateProjectLocal({
      sloDefinitions: project?.sloDefinitions.filter(s => s.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  const addAutoscaling = useCallback((strategy: AutoscalingStrategy) => {
    updateProjectLocal({ 
      autoscalingStrategies: [...(project?.autoscalingStrategies || []), strategy] 
    });
  }, [project, updateProjectLocal]);

  const updateAutoscaling = useCallback((id: string, updates: Partial<AutoscalingStrategy>) => {
    updateProjectLocal({
      autoscalingStrategies: project?.autoscalingStrategies.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeAutoscaling = useCallback((id: string) => {
    updateProjectLocal({
      autoscalingStrategies: project?.autoscalingStrategies.filter(s => s.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  const addK8sManifest = useCallback((manifest: K8sManifest) => {
    updateProjectLocal({ 
      k8sManifests: [...(project?.k8sManifests || []), manifest] 
    });
  }, [project, updateProjectLocal]);

  const updateK8sManifest = useCallback((id: string, updates: Partial<K8sManifest>) => {
    updateProjectLocal({
      k8sManifests: project?.k8sManifests.map(m => 
        m.id === id ? { ...m, ...updates } : m
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeK8sManifest = useCallback((id: string) => {
    updateProjectLocal({
      k8sManifests: project?.k8sManifests.filter(m => m.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  // Phase D methods
  const addResiliencePattern = useCallback((pattern: ResiliencePattern) => {
    updateProjectLocal({ 
      resiliencePatterns: [...(project?.resiliencePatterns || []), pattern] 
    });
  }, [project, updateProjectLocal]);

  const updateResiliencePattern = useCallback((id: string, updates: Partial<ResiliencePattern>) => {
    updateProjectLocal({
      resiliencePatterns: project?.resiliencePatterns.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeResiliencePattern = useCallback((id: string) => {
    updateProjectLocal({
      resiliencePatterns: project?.resiliencePatterns.filter(p => p.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  const addObservabilityConfig = useCallback((config: ObservabilityConfig) => {
    updateProjectLocal({ 
      observabilityConfigs: [...(project?.observabilityConfigs || []), config] 
    });
  }, [project, updateProjectLocal]);

  const updateObservabilityConfig = useCallback((id: string, updates: Partial<ObservabilityConfig>) => {
    updateProjectLocal({
      observabilityConfigs: project?.observabilityConfigs.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ) || []
    });
  }, [project, updateProjectLocal]);

  const removeObservabilityConfig = useCallback((id: string) => {
    updateProjectLocal({
      observabilityConfigs: project?.observabilityConfigs.filter(c => c.id !== id) || []
    });
  }, [project, updateProjectLocal]);

  const value: ProjectContextType = {
    project,
    currentPhase,
    validationResults,
    recommendations,
    isLoading,
    isSaving,
    isValidating,
    isGeneratingRecommendations,
    createProject,
    loadProject,
    resetProject,
    saveProject,
    setPhase,
    canAdvanceToPhase,
    addBoundedContext,
    updateBoundedContext,
    removeBoundedContext,
    addService,
    updateService,
    removeService,
    addContainerConfig,
    updateContainerConfig,
    removeContainerConfig,
    addSLO,
    updateSLO,
    removeSLO,
    addAutoscaling,
    updateAutoscaling,
    removeAutoscaling,
    addK8sManifest,
    updateK8sManifest,
    removeK8sManifest,
    addResiliencePattern,
    updateResiliencePattern,
    removeResiliencePattern,
    addObservabilityConfig,
    updateObservabilityConfig,
    removeObservabilityConfig,
    runValidation,
    fetchRecommendations,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
