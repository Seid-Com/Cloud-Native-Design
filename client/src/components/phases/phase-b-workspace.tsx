import { useState } from "react";
import { Plus, Trash2, Edit2, Box, Copy, Check, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/lib/project-context";
import type { ContainerConfig } from "@shared/schema";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const baseImageOptions = [
  { value: "node:20-alpine", label: "Node.js 20 Alpine", category: "Node.js" },
  { value: "node:18-alpine", label: "Node.js 18 Alpine", category: "Node.js" },
  { value: "python:3.12-slim", label: "Python 3.12 Slim", category: "Python" },
  { value: "python:3.11-slim", label: "Python 3.11 Slim", category: "Python" },
  { value: "golang:1.22-alpine", label: "Go 1.22 Alpine", category: "Go" },
  { value: "openjdk:21-slim", label: "OpenJDK 21 Slim", category: "Java" },
  { value: "rust:1.75-slim", label: "Rust 1.75 Slim", category: "Rust" },
];

function generateDockerfile(config: ContainerConfig, serviceName: string): string {
  const baseImage = config.baseImage || "node:20-alpine";
  
  if (config.buildType === "multi-stage") {
    return `# Multi-stage build for ${serviceName}
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

${config.environmentVariables.map(env => 
  env.isSecret 
    ? `# ${env.key} - Set via secrets management` 
    : `ENV ${env.key}="${env.value}"`
).join('\n')}

${config.exposedPorts.map(port => `EXPOSE ${port}`).join('\n')}

${config.healthCheck ? `HEALTHCHECK --interval=${config.healthCheck.intervalSeconds}s \\
  CMD wget --quiet --tries=1 --spider http://localhost:${config.healthCheck.port}${config.healthCheck.path} || exit 1` : ''}

USER node
CMD ["node", "dist/index.js"]`;
  }

  return `# Single-stage build for ${serviceName}
FROM ${baseImage}
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${config.environmentVariables.map(env => 
  env.isSecret 
    ? `# ${env.key} - Set via secrets management` 
    : `ENV ${env.key}="${env.value}"`
).join('\n')}

${config.exposedPorts.map(port => `EXPOSE ${port}`).join('\n')}

${config.healthCheck ? `HEALTHCHECK --interval=${config.healthCheck.intervalSeconds}s \\
  CMD wget --quiet --tries=1 --spider http://localhost:${config.healthCheck.port}${config.healthCheck.path} || exit 1` : ''}

USER node
CMD ["node", "index.js"]`;
}

function ContainerCard({ 
  config, 
  serviceName,
  onEdit, 
  onDelete 
}: { 
  config: ContainerConfig;
  serviceName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyDockerfile = () => {
    navigator.clipboard.writeText(generateDockerfile(config, serviceName));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{serviceName}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {config.baseImage}
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" onClick={handleCopyDockerfile}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={config.buildType === "multi-stage" ? "default" : "secondary"}>
            {config.buildType === "multi-stage" ? "Multi-Stage" : "Single-Stage"}
          </Badge>
          {config.exposedPorts.map((port) => (
            <Badge key={port} variant="outline" className="text-xs">
              :{port}
            </Badge>
          ))}
        </div>

        {config.resourceLimits && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPU:</span>
              <span>{config.resourceLimits.cpuLimit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory:</span>
              <span>{config.resourceLimits.memoryLimit}</span>
            </div>
          </div>
        )}

        {config.healthCheck && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Health Check:</p>
            <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
              GET {config.healthCheck.path}
            </code>
          </div>
        )}

        {config.environmentVariables.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">
              {config.environmentVariables.length} environment variable{config.environmentVariables.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContainerDialog({
  isOpen,
  onClose,
  config,
  serviceId,
  serviceName,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: ContainerConfig | null;
  serviceId: string;
  serviceName: string;
  onSave: (config: ContainerConfig) => void;
}) {
  const [formData, setFormData] = useState<Partial<ContainerConfig>>(
    config || {
      baseImage: "node:20-alpine",
      buildType: "multi-stage",
      exposedPorts: [3000],
      environmentVariables: [],
      healthCheck: {
        path: "/health",
        port: 3000,
        intervalSeconds: 30,
      },
      resourceLimits: {
        cpuLimit: "500m",
        memoryLimit: "512Mi",
        cpuRequest: "100m",
        memoryRequest: "128Mi",
      },
    }
  );
  const [portsText, setPortsText] = useState(
    config?.exposedPorts.join(", ") || "3000"
  );
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");
  const [newEnvIsSecret, setNewEnvIsSecret] = useState(false);

  const handleSave = () => {
    const newConfig: ContainerConfig = {
      id: config?.id || generateId(),
      serviceId,
      baseImage: formData.baseImage || "node:20-alpine",
      buildType: formData.buildType || "multi-stage",
      exposedPorts: portsText.split(",").map(p => parseInt(p.trim())).filter(p => !isNaN(p)),
      environmentVariables: formData.environmentVariables || [],
      healthCheck: formData.healthCheck,
      resourceLimits: formData.resourceLimits,
    };
    onSave(newConfig);
    onClose();
  };

  const addEnvVar = () => {
    if (newEnvKey.trim()) {
      setFormData({
        ...formData,
        environmentVariables: [
          ...(formData.environmentVariables || []),
          { key: newEnvKey.trim(), value: newEnvValue, isSecret: newEnvIsSecret },
        ],
      });
      setNewEnvKey("");
      setNewEnvValue("");
      setNewEnvIsSecret(false);
    }
  };

  const removeEnvVar = (key: string) => {
    setFormData({
      ...formData,
      environmentVariables: formData.environmentVariables?.filter(e => e.key !== key) || [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? "Edit" : "Configure"} Container: {serviceName}
          </DialogTitle>
          <DialogDescription>
            Set up containerization settings including base image, build strategy, and resource limits.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Base Image</Label>
              <Select
                value={formData.baseImage}
                onValueChange={(value) => setFormData({ ...formData, baseImage: value })}
              >
                <SelectTrigger data-testid="select-base-image">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {baseImageOptions.map((img) => (
                    <SelectItem key={img.value} value={img.value}>
                      {img.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Build Type</Label>
              <Select
                value={formData.buildType}
                onValueChange={(value: "single-stage" | "multi-stage") => 
                  setFormData({ ...formData, buildType: value })
                }
              >
                <SelectTrigger data-testid="select-build-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi-stage">Multi-Stage (Recommended)</SelectItem>
                  <SelectItem value="single-stage">Single-Stage</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Multi-stage builds create smaller, more secure production images.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Exposed Ports (comma-separated)</Label>
              <Input
                value={portsText}
                onChange={(e) => setPortsText(e.target.value)}
                placeholder="3000, 8080"
                data-testid="input-ports"
              />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPU Request</Label>
                <Input
                  value={formData.resourceLimits?.cpuRequest}
                  onChange={(e) => setFormData({
                    ...formData,
                    resourceLimits: { ...formData.resourceLimits!, cpuRequest: e.target.value }
                  })}
                  placeholder="100m"
                  data-testid="input-cpu-request"
                />
              </div>
              <div className="space-y-2">
                <Label>CPU Limit</Label>
                <Input
                  value={formData.resourceLimits?.cpuLimit}
                  onChange={(e) => setFormData({
                    ...formData,
                    resourceLimits: { ...formData.resourceLimits!, cpuLimit: e.target.value }
                  })}
                  placeholder="500m"
                  data-testid="input-cpu-limit"
                />
              </div>
              <div className="space-y-2">
                <Label>Memory Request</Label>
                <Input
                  value={formData.resourceLimits?.memoryRequest}
                  onChange={(e) => setFormData({
                    ...formData,
                    resourceLimits: { ...formData.resourceLimits!, memoryRequest: e.target.value }
                  })}
                  placeholder="128Mi"
                  data-testid="input-memory-request"
                />
              </div>
              <div className="space-y-2">
                <Label>Memory Limit</Label>
                <Input
                  value={formData.resourceLimits?.memoryLimit}
                  onChange={(e) => setFormData({
                    ...formData,
                    resourceLimits: { ...formData.resourceLimits!, memoryLimit: e.target.value }
                  })}
                  placeholder="512Mi"
                  data-testid="input-memory-limit"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="env" className="space-y-4 mt-4">
            <div className="space-y-3">
              {formData.environmentVariables?.map((env) => (
                <div key={env.key} className="flex items-center gap-2">
                  <Badge variant={env.isSecret ? "secondary" : "outline"} className="shrink-0">
                    {env.isSecret ? "Secret" : "Env"}
                  </Badge>
                  <code className="text-sm flex-1 truncate">{env.key}</code>
                  {!env.isSecret && (
                    <code className="text-sm text-muted-foreground truncate max-w-32">
                      {env.value}
                    </code>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => removeEnvVar(env.key)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="DATABASE_URL"
                    data-testid="input-env-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    placeholder="postgres://..."
                    disabled={newEnvIsSecret}
                    data-testid="input-env-value"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newEnvIsSecret}
                    onCheckedChange={setNewEnvIsSecret}
                    data-testid="switch-is-secret"
                  />
                  <Label>Is Secret</Label>
                </div>
                <Button size="sm" onClick={addEnvVar} disabled={!newEnvKey.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variable
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Health Check Path</Label>
              <Input
                value={formData.healthCheck?.path}
                onChange={(e) => setFormData({
                  ...formData,
                  healthCheck: { ...formData.healthCheck!, path: e.target.value }
                })}
                placeholder="/health"
                data-testid="input-health-path"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  type="number"
                  value={formData.healthCheck?.port}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthCheck: { ...formData.healthCheck!, port: parseInt(e.target.value) }
                  })}
                  placeholder="3000"
                  data-testid="input-health-port"
                />
              </div>
              <div className="space-y-2">
                <Label>Interval (seconds)</Label>
                <Input
                  type="number"
                  value={formData.healthCheck?.intervalSeconds}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthCheck: { ...formData.healthCheck!, intervalSeconds: parseInt(e.target.value) }
                  })}
                  placeholder="30"
                  data-testid="input-health-interval"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {config ? "Update" : "Save"} Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DockerfilePreview({ config, serviceName }: { config: ContainerConfig; serviceName: string }) {
  const [copied, setCopied] = useState(false);
  const dockerfile = generateDockerfile(config, serviceName);

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerfile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Dockerfile Preview
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto font-mono whitespace-pre-wrap">
          {dockerfile}
        </pre>
      </CardContent>
    </Card>
  );
}

export function PhaseBWorkspace() {
  const { 
    project, 
    addContainerConfig, 
    updateContainerConfig, 
    removeContainerConfig,
    setPhase,
    canAdvanceToPhase
  } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ContainerConfig | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [previewServiceId, setPreviewServiceId] = useState<string | null>(null);

  if (!project) return null;

  const getConfigForService = (serviceId: string) => 
    project.containerConfigs.find(c => c.serviceId === serviceId);

  const getServiceName = (serviceId: string) =>
    project.services.find(s => s.id === serviceId)?.name || "Unknown Service";

  const unconfiguredServices = project.services.filter(
    s => !project.containerConfigs.some(c => c.serviceId === s.id)
  );

  const handleConfigureService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setEditingConfig(getConfigForService(serviceId) || null);
    setIsDialogOpen(true);
  };

  const handleSaveConfig = (config: ContainerConfig) => {
    if (editingConfig) {
      updateContainerConfig(config.id, config);
    } else {
      addContainerConfig(config);
    }
    setEditingConfig(null);
  };

  const previewConfig = previewServiceId ? getConfigForService(previewServiceId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Phase B: Containerization</h2>
            <p className="text-muted-foreground mt-1">
              Configure container builds with optimized Dockerfiles and resource limits
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {unconfiguredServices.length > 0 && (
            <section>
              <h3 className="text-lg font-medium mb-4">Services Needing Configuration</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unconfiguredServices.map((service) => (
                  <Card key={service.id} className="border-dashed">
                    <CardContent className="py-6 text-center">
                      <Box className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium mb-2">{service.name}</h4>
                      <Button
                        size="sm"
                        onClick={() => handleConfigureService(service.id)}
                        data-testid={`button-configure-${service.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-medium mb-4">
              Configured Containers
              {project.containerConfigs.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {project.containerConfigs.length}
                </Badge>
              )}
            </h3>

            {project.containerConfigs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No containers configured yet</h4>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Configure containerization for each service to generate optimized 
                    Dockerfiles with multi-stage builds and security best practices.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.containerConfigs.map((config) => (
                  <div key={config.id}>
                    <ContainerCard
                      config={config}
                      serviceName={getServiceName(config.serviceId)}
                      onEdit={() => handleConfigureService(config.serviceId)}
                      onDelete={() => removeContainerConfig(config.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setPreviewServiceId(
                        previewServiceId === config.serviceId ? null : config.serviceId
                      )}
                    >
                      {previewServiceId === config.serviceId ? "Hide" : "Preview"} Dockerfile
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {previewConfig && (
            <section>
              <DockerfilePreview 
                config={previewConfig} 
                serviceName={getServiceName(previewConfig.serviceId)} 
              />
            </section>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {project.containerConfigs.length === 0 
              ? "Configure at least one container to proceed to Phase C"
              : `${project.containerConfigs.length} of ${project.services.length} services configured`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase("A")}>
              Back to Phase A
            </Button>
            <Button
              onClick={() => setPhase("C")}
              disabled={!canAdvanceToPhase("C")}
              data-testid="button-proceed-phase-c"
            >
              Continue to Orchestration
            </Button>
          </div>
        </div>
      </div>

      {selectedServiceId && (
        <ContainerDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingConfig(null);
            setSelectedServiceId("");
          }}
          config={editingConfig}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}
