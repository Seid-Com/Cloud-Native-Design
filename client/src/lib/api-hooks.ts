import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { ArchitectureProject, ValidationResult, AIRecommendation } from "@shared/schema";

export function useCreateProject() {
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json() as Promise<ArchitectureProject>;
    },
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ArchitectureProject>) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return response.json() as Promise<ArchitectureProject>;
    },
  });
}

export function useValidateProject() {
  return useMutation({
    mutationFn: async (data: { project: ArchitectureProject; phase: string }) => {
      const response = await apiRequest("POST", "/api/validate", data);
      const result = await response.json();
      return result.validations as ValidationResult[];
    },
  });
}

export function useGetRecommendations() {
  return useMutation({
    mutationFn: async (data: { project: ArchitectureProject; phase: string }) => {
      const response = await apiRequest("POST", "/api/recommendations", data);
      const result = await response.json();
      return result.recommendations as AIRecommendation[];
    },
  });
}

export function useGenerateDockerfile() {
  return useMutation({
    mutationFn: async (data: { containerConfig: any; serviceName: string }) => {
      const response = await apiRequest("POST", "/api/generate/dockerfile", data);
      const result = await response.json();
      return result.dockerfile as string;
    },
  });
}

export function useGenerateK8sManifest() {
  return useMutation({
    mutationFn: async (data: { manifest: any; serviceName: string; containerConfig?: any }) => {
      const response = await apiRequest("POST", "/api/generate/k8s-manifest", data);
      const result = await response.json();
      return result.manifest as string;
    },
  });
}
