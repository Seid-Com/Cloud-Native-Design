import { useState } from "react";
import { Plus, Trash2, Edit2, Target, TrendingUp, Copy, Check, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/lib/project-context";
import type { SLODefinition, AutoscalingStrategy, K8sManifest } from "@shared/schema";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateK8sManifest(
  manifest: K8sManifest, 
  serviceName: string, 
  containerConfig: any
): string {
  const labels = { ...manifest.labels, app: serviceName.toLowerCase() };
  
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${serviceName.toLowerCase()}
  namespace: ${manifest.namespace}
  labels:
${Object.entries(labels).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}
${manifest.annotations ? `  annotations:\n${Object.entries(manifest.annotations).map(([k, v]) => `    ${k}: "${v}"`).join('\n')}` : ''}
spec:
  replicas: ${manifest.replicas}
  selector:
    matchLabels:
      app: ${serviceName.toLowerCase()}
  strategy:
    type: ${manifest.deploymentStrategy}
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
  namespace: ${manifest.namespace}
spec:
  selector:
    app: ${serviceName.toLowerCase()}
  ports:
  - port: 80
    targetPort: ${containerConfig?.exposedPorts?.[0] || 3000}
  type: ClusterIP`;
}

function SLOCard({ slo, serviceName, onEdit, onDelete }: {
  slo: SLODefinition;
  serviceName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{serviceName}</CardTitle>
            <CardDescription className="text-xs mt-1 capitalize">
              {slo.metric.replace("-", " ")}
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{slo.target}{slo.unit}</p>
            <p className="text-xs text-muted-foreground">over {slo.window}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AutoscalingCard({ strategy, serviceName, onEdit, onDelete }: {
  strategy: AutoscalingStrategy;
  serviceName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{serviceName}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {strategy.type}
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
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
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div className="text-sm">
            <span className="font-medium">{strategy.minReplicas}</span>
            <span className="text-muted-foreground mx-2">to</span>
            <span className="font-medium">{strategy.maxReplicas}</span>
            <span className="text-muted-foreground ml-1">replicas</span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Target Metric</p>
          <p className="text-sm font-medium">
            {strategy.targetMetric}: {strategy.targetValue}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ManifestCard({ manifest, serviceName, containerConfig, onEdit, onDelete }: {
  manifest: K8sManifest;
  serviceName: string;
  containerConfig: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateK8sManifest(manifest, serviceName, containerConfig));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Card className="hover-elevate">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{serviceName}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {manifest.namespace}
              </CardDescription>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={handleCopy}>
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
            <Badge variant="default">{manifest.deploymentStrategy}</Badge>
            <Badge variant="secondary">{manifest.replicas} replicas</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(manifest.labels).slice(0, 3).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowPreview(!showPreview)}
      >
        <FileCode className="h-4 w-4 mr-2" />
        {showPreview ? "Hide" : "Preview"} YAML
      </Button>
      {showPreview && (
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto font-mono whitespace-pre-wrap">
              {generateK8sManifest(manifest, serviceName, containerConfig)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SLODialog({ isOpen, onClose, slo, serviceId, serviceName, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  slo: SLODefinition | null;
  serviceId: string;
  serviceName: string;
  onSave: (slo: SLODefinition) => void;
}) {
  const [formData, setFormData] = useState<Partial<SLODefinition>>(
    slo || {
      metric: "availability",
      target: 99.9,
      unit: "%",
      window: "30 days",
    }
  );

  const handleSave = () => {
    const newSLO: SLODefinition = {
      id: slo?.id || generateId(),
      serviceId,
      metric: formData.metric || "availability",
      target: formData.target || 99.9,
      unit: formData.unit || "%",
      window: formData.window || "30 days",
    };
    onSave(newSLO);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{slo ? "Edit" : "Add"} SLO: {serviceName}</DialogTitle>
          <DialogDescription>
            Define a service level objective for this service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              value={formData.metric}
              onValueChange={(value: SLODefinition["metric"]) => 
                setFormData({ ...formData, metric: value })
              }
            >
              <SelectTrigger data-testid="select-slo-metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="latency">Latency (p95)</SelectItem>
                <SelectItem value="throughput">Throughput</SelectItem>
                <SelectItem value="error-rate">Error Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                data-testid="input-slo-target"
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger data-testid="select-slo-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                  <SelectItem value="ms">Milliseconds (ms)</SelectItem>
                  <SelectItem value="req/s">Requests/second</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Measurement Window</Label>
            <Select
              value={formData.window}
              onValueChange={(value) => setFormData({ ...formData, window: value })}
            >
              <SelectTrigger data-testid="select-slo-window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7 days">7 days</SelectItem>
                <SelectItem value="14 days">14 days</SelectItem>
                <SelectItem value="30 days">30 days</SelectItem>
                <SelectItem value="90 days">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{slo ? "Update" : "Add"} SLO</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AutoscalingDialog({ isOpen, onClose, strategy, serviceId, serviceName, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  strategy: AutoscalingStrategy | null;
  serviceId: string;
  serviceName: string;
  onSave: (strategy: AutoscalingStrategy) => void;
}) {
  const [formData, setFormData] = useState<Partial<AutoscalingStrategy>>(
    strategy || {
      type: "HPA",
      minReplicas: 2,
      maxReplicas: 10,
      targetMetric: "cpu",
      targetValue: 70,
    }
  );

  const handleSave = () => {
    const newStrategy: AutoscalingStrategy = {
      id: strategy?.id || generateId(),
      serviceId,
      type: formData.type || "HPA",
      minReplicas: formData.minReplicas || 2,
      maxReplicas: formData.maxReplicas || 10,
      targetMetric: formData.targetMetric || "cpu",
      targetValue: formData.targetValue || 70,
    };
    onSave(newStrategy);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strategy ? "Edit" : "Add"} Autoscaling: {serviceName}</DialogTitle>
          <DialogDescription>
            Configure autoscaling strategy for this service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Autoscaling Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: AutoscalingStrategy["type"]) => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger data-testid="select-autoscaling-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HPA">Horizontal Pod Autoscaler (HPA)</SelectItem>
                <SelectItem value="VPA">Vertical Pod Autoscaler (VPA)</SelectItem>
                <SelectItem value="KEDA">KEDA (Event-driven)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Replicas</Label>
              <Input
                type="number"
                min="1"
                value={formData.minReplicas}
                onChange={(e) => setFormData({ ...formData, minReplicas: parseInt(e.target.value) })}
                data-testid="input-min-replicas"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Replicas</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxReplicas}
                onChange={(e) => setFormData({ ...formData, maxReplicas: parseInt(e.target.value) })}
                data-testid="input-max-replicas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Metric</Label>
              <Select
                value={formData.targetMetric}
                onValueChange={(value) => setFormData({ ...formData, targetMetric: value })}
              >
                <SelectTrigger data-testid="select-target-metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpu">CPU Utilization</SelectItem>
                  <SelectItem value="memory">Memory Utilization</SelectItem>
                  <SelectItem value="requests">Request Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Value (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                data-testid="input-target-value"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{strategy ? "Update" : "Add"} Strategy</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManifestDialog({ isOpen, onClose, manifest, serviceId, serviceName, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  manifest: K8sManifest | null;
  serviceId: string;
  serviceName: string;
  onSave: (manifest: K8sManifest) => void;
}) {
  const [formData, setFormData] = useState<Partial<K8sManifest>>(
    manifest || {
      deploymentStrategy: "RollingUpdate",
      replicas: 3,
      namespace: "default",
      labels: { environment: "production", tier: "backend" },
    }
  );
  const [labelsText, setLabelsText] = useState(
    Object.entries(manifest?.labels || { environment: "production", tier: "backend" })
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")
  );

  const handleSave = () => {
    const labels = labelsText.split(",").reduce((acc, pair) => {
      const [key, value] = pair.split("=").map(s => s.trim());
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const newManifest: K8sManifest = {
      id: manifest?.id || generateId(),
      serviceId,
      deploymentStrategy: formData.deploymentStrategy || "RollingUpdate",
      replicas: formData.replicas || 3,
      namespace: formData.namespace || "default",
      labels,
      annotations: formData.annotations,
    };
    onSave(newManifest);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{manifest ? "Edit" : "Add"} Manifest: {serviceName}</DialogTitle>
          <DialogDescription>
            Configure Kubernetes deployment manifest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Namespace</Label>
            <Input
              value={formData.namespace}
              onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
              placeholder="default"
              data-testid="input-namespace"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deployment Strategy</Label>
              <Select
                value={formData.deploymentStrategy}
                onValueChange={(value: K8sManifest["deploymentStrategy"]) => 
                  setFormData({ ...formData, deploymentStrategy: value })
                }
              >
                <SelectTrigger data-testid="select-deployment-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RollingUpdate">Rolling Update</SelectItem>
                  <SelectItem value="Recreate">Recreate</SelectItem>
                  <SelectItem value="BlueGreen">Blue/Green</SelectItem>
                  <SelectItem value="Canary">Canary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Replicas</Label>
              <Input
                type="number"
                min="1"
                value={formData.replicas}
                onChange={(e) => setFormData({ ...formData, replicas: parseInt(e.target.value) })}
                data-testid="input-replicas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Labels (comma-separated, key=value)</Label>
            <Input
              value={labelsText}
              onChange={(e) => setLabelsText(e.target.value)}
              placeholder="environment=production, tier=backend"
              data-testid="input-labels"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{manifest ? "Update" : "Add"} Manifest</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PhaseCWorkspace() {
  const { 
    project, 
    addSLO,
    updateSLO,
    removeSLO,
    addAutoscaling,
    updateAutoscaling,
    removeAutoscaling,
    addK8sManifest,
    updateK8sManifest,
    removeK8sManifest,
    setPhase,
    canAdvanceToPhase
  } = useProject();

  const [activeTab, setActiveTab] = useState("slo");
  const [dialogType, setDialogType] = useState<"slo" | "autoscaling" | "manifest" | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [editingItem, setEditingItem] = useState<any>(null);

  if (!project) return null;

  const getServiceName = (serviceId: string) =>
    project.services.find(s => s.id === serviceId)?.name || "Unknown Service";

  const getContainerConfig = (serviceId: string) =>
    project.containerConfigs.find(c => c.serviceId === serviceId);

  const openDialog = (type: "slo" | "autoscaling" | "manifest", serviceId: string, item?: any) => {
    setDialogType(type);
    setSelectedServiceId(serviceId);
    setEditingItem(item || null);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedServiceId("");
    setEditingItem(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Phase C: Orchestration & Scaling</h2>
            <p className="text-muted-foreground mt-1">
              Define SLOs, autoscaling strategies, and Kubernetes deployment manifests
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slo" data-testid="tab-slo">
              SLO Definitions
              {project.sloDefinitions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{project.sloDefinitions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="autoscaling" data-testid="tab-autoscaling">
              Autoscaling
              {project.autoscalingStrategies.length > 0 && (
                <Badge variant="secondary" className="ml-2">{project.autoscalingStrategies.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manifests" data-testid="tab-manifests">
              K8s Manifests
              {project.k8sManifests.length > 0 && (
                <Badge variant="secondary" className="ml-2">{project.k8sManifests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="slo" className="p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Service Level Objectives</h3>
              <Select onValueChange={(serviceId) => openDialog("slo", serviceId)}>
                <SelectTrigger className="w-48" data-testid="select-add-slo">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add SLO for..." />
                </SelectTrigger>
                <SelectContent>
                  {project.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.sloDefinitions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No SLOs defined yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Define service level objectives to establish reliability targets for your services.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.sloDefinitions.map((slo) => (
                  <SLOCard
                    key={slo.id}
                    slo={slo}
                    serviceName={getServiceName(slo.serviceId)}
                    onEdit={() => openDialog("slo", slo.serviceId, slo)}
                    onDelete={() => removeSLO(slo.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="autoscaling" className="p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Autoscaling Strategies</h3>
              <Select onValueChange={(serviceId) => openDialog("autoscaling", serviceId)}>
                <SelectTrigger className="w-48" data-testid="select-add-autoscaling">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add strategy for..." />
                </SelectTrigger>
                <SelectContent>
                  {project.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.autoscalingStrategies.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No autoscaling configured yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Configure autoscaling strategies to automatically adjust capacity based on demand.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.autoscalingStrategies.map((strategy) => (
                  <AutoscalingCard
                    key={strategy.id}
                    strategy={strategy}
                    serviceName={getServiceName(strategy.serviceId)}
                    onEdit={() => openDialog("autoscaling", strategy.serviceId, strategy)}
                    onDelete={() => removeAutoscaling(strategy.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manifests" className="p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Kubernetes Manifests</h3>
              <Select onValueChange={(serviceId) => openDialog("manifest", serviceId)}>
                <SelectTrigger className="w-48" data-testid="select-add-manifest">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add manifest for..." />
                </SelectTrigger>
                <SelectContent>
                  {project.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.k8sManifests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No manifests generated yet</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate Kubernetes deployment manifests with proper resource limits and deployment strategies.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {project.k8sManifests.map((manifest) => (
                  <ManifestCard
                    key={manifest.id}
                    manifest={manifest}
                    serviceName={getServiceName(manifest.serviceId)}
                    containerConfig={getContainerConfig(manifest.serviceId)}
                    onEdit={() => openDialog("manifest", manifest.serviceId, manifest)}
                    onDelete={() => removeK8sManifest(manifest.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {project.k8sManifests.length === 0 
              ? "Add at least one K8s manifest to proceed to Phase D"
              : `${project.k8sManifests.length} manifest${project.k8sManifests.length > 1 ? 's' : ''} configured`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase("B")}>
              Back to Phase B
            </Button>
            <Button
              onClick={() => setPhase("D")}
              disabled={!canAdvanceToPhase("D")}
              data-testid="button-proceed-phase-d"
            >
              Continue to Resilience
            </Button>
          </div>
        </div>
      </div>

      {dialogType === "slo" && selectedServiceId && (
        <SLODialog
          isOpen={true}
          onClose={closeDialog}
          slo={editingItem}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={(slo) => {
            if (editingItem) updateSLO(slo.id, slo);
            else addSLO(slo);
            closeDialog();
          }}
        />
      )}

      {dialogType === "autoscaling" && selectedServiceId && (
        <AutoscalingDialog
          isOpen={true}
          onClose={closeDialog}
          strategy={editingItem}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={(strategy) => {
            if (editingItem) updateAutoscaling(strategy.id, strategy);
            else addAutoscaling(strategy);
            closeDialog();
          }}
        />
      )}

      {dialogType === "manifest" && selectedServiceId && (
        <ManifestDialog
          isOpen={true}
          onClose={closeDialog}
          manifest={editingItem}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={(manifest) => {
            if (editingItem) updateK8sManifest(manifest.id, manifest);
            else addK8sManifest(manifest);
            closeDialog();
          }}
        />
      )}
    </div>
  );
}
