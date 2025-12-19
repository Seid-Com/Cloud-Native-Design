import { useState } from "react";
import { Plus, Trash2, Edit2, Shield, Activity, BarChart3, FileText, Radar, Copy, Check } from "lucide-react";
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
import type { ResiliencePattern, ObservabilityConfig } from "@shared/schema";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const resiliencePatternTemplates = {
  "circuit-breaker": {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000,
    halfOpenRequests: 1,
  },
  "bulkhead": {
    maxConcurrent: 10,
    maxQueue: 100,
    queueTimeout: 5000,
  },
  "retry": {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  "timeout": {
    connectionTimeout: 5000,
    requestTimeout: 30000,
  },
  "rate-limiter": {
    requestsPerSecond: 100,
    burstSize: 150,
  },
};

const patternIcons = {
  "circuit-breaker": Shield,
  "bulkhead": Activity,
  "retry": Radar,
  "timeout": BarChart3,
  "rate-limiter": FileText,
};

function generateResilienceCode(pattern: ResiliencePattern): string {
  const config = pattern.config;
  
  switch (pattern.type) {
    case "circuit-breaker":
      return `// Circuit Breaker Configuration
const circuitBreaker = new CircuitBreaker({
  failureThreshold: ${config.failureThreshold || 5},
  successThreshold: ${config.successThreshold || 3},
  timeout: ${config.timeout || 30000},
  halfOpenRequests: ${config.halfOpenRequests || 1},
});

// Usage
const result = await circuitBreaker.execute(() => serviceCall());`;

    case "bulkhead":
      return `// Bulkhead Configuration
const bulkhead = new Bulkhead({
  maxConcurrent: ${config.maxConcurrent || 10},
  maxQueue: ${config.maxQueue || 100},
  queueTimeout: ${config.queueTimeout || 5000},
});

// Usage
const result = await bulkhead.execute(() => serviceCall());`;

    case "retry":
      return `// Retry Configuration
const retryPolicy = new RetryPolicy({
  maxAttempts: ${config.maxAttempts || 3},
  initialDelay: ${config.initialDelay || 1000},
  maxDelay: ${config.maxDelay || 10000},
  backoffMultiplier: ${config.backoffMultiplier || 2},
});

// Usage
const result = await retryPolicy.execute(() => serviceCall());`;

    case "timeout":
      return `// Timeout Configuration
const timeoutPolicy = new TimeoutPolicy({
  connectionTimeout: ${config.connectionTimeout || 5000},
  requestTimeout: ${config.requestTimeout || 30000},
});

// Usage
const result = await timeoutPolicy.execute(() => serviceCall());`;

    case "rate-limiter":
      return `// Rate Limiter Configuration
const rateLimiter = new RateLimiter({
  requestsPerSecond: ${config.requestsPerSecond || 100},
  burstSize: ${config.burstSize || 150},
});

// Usage
await rateLimiter.acquire();
const result = await serviceCall();`;

    default:
      return "// Unknown pattern type";
  }
}

function generateObservabilityCode(config: ObservabilityConfig, serviceName: string): string {
  let code = `// Observability Configuration for ${serviceName}\n\n`;

  if (config.metrics.enabled) {
    code += `// Metrics Setup
const metrics = new PrometheusMetrics({
  endpoint: '${config.metrics.endpoint || '/metrics'}',
  scrapeInterval: '${config.metrics.scrapeInterval || '15s'}',
  labels: { service: '${serviceName.toLowerCase()}' },
});

// Custom metrics
const requestCounter = metrics.counter('http_requests_total', 'Total HTTP requests');
const requestDuration = metrics.histogram('http_request_duration_seconds', 'HTTP request latency');

`;
  }

  if (config.logging.enabled) {
    code += `// Logging Setup
const logger = new StructuredLogger({
  level: '${config.logging.level}',
  format: '${config.logging.format}',
  service: '${serviceName.toLowerCase()}',
});

// Usage
logger.info('Request processed', { requestId, userId, duration });

`;
  }

  if (config.tracing.enabled) {
    code += `// Distributed Tracing Setup
const tracer = new OpenTelemetryTracer({
  serviceName: '${serviceName.toLowerCase()}',
  samplingRate: ${config.tracing.samplingRate || 0.1},
  exporter: '${config.tracing.exporter || 'otlp'}',
});

// Usage
const span = tracer.startSpan('processOrder');
try {
  // ... operation
} finally {
  span.end();
}`;
  }

  return code;
}

function ResilienceCard({ pattern, serviceName, onEdit, onDelete }: {
  pattern: ResiliencePattern;
  serviceName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = patternIcons[pattern.type] || Shield;

  const handleCopy = () => {
    navigator.clipboard.writeText(generateResilienceCode(pattern));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <CardTitle className="text-base truncate">{serviceName}</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1 capitalize">
              {pattern.type.replace("-", " ")}
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
        <div className="flex items-center gap-2">
          <Badge variant={pattern.enabled ? "default" : "secondary"}>
            {pattern.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(pattern.config).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ObservabilityCard({ config, serviceName, onEdit, onDelete }: {
  config: ObservabilityConfig;
  serviceName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateObservabilityCode(config, serviceName));
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
              Observability Stack
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
          {config.metrics.enabled && (
            <Badge variant="default">
              <BarChart3 className="h-3 w-3 mr-1" />
              Metrics
            </Badge>
          )}
          {config.logging.enabled && (
            <Badge variant="default">
              <FileText className="h-3 w-3 mr-1" />
              Logging
            </Badge>
          )}
          {config.tracing.enabled && (
            <Badge variant="default">
              <Radar className="h-3 w-3 mr-1" />
              Tracing
            </Badge>
          )}
        </div>
        <div className="space-y-1 text-xs">
          {config.logging.enabled && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Log Level:</span>
              <span className="capitalize">{config.logging.level}</span>
            </div>
          )}
          {config.tracing.enabled && config.tracing.samplingRate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sampling Rate:</span>
              <span>{(config.tracing.samplingRate * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResilienceDialog({ isOpen, onClose, pattern, serviceId, serviceName, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  pattern: ResiliencePattern | null;
  serviceId: string;
  serviceName: string;
  onSave: (pattern: ResiliencePattern) => void;
}) {
  const [formData, setFormData] = useState<Partial<ResiliencePattern>>(
    pattern || {
      type: "circuit-breaker",
      config: resiliencePatternTemplates["circuit-breaker"],
      enabled: true,
    }
  );

  const handleTypeChange = (type: ResiliencePattern["type"]) => {
    setFormData({
      ...formData,
      type,
      config: resiliencePatternTemplates[type],
    });
  };

  const handleSave = () => {
    const newPattern: ResiliencePattern = {
      id: pattern?.id || generateId(),
      serviceId,
      type: formData.type || "circuit-breaker",
      config: formData.config || {},
      enabled: formData.enabled ?? true,
    };
    onSave(newPattern);
    onClose();
  };

  const currentConfig = formData.config || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{pattern ? "Edit" : "Add"} Resilience Pattern: {serviceName}</DialogTitle>
          <DialogDescription>
            Configure resilience patterns to improve fault tolerance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Label>Pattern Type</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger data-testid="select-pattern-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circuit-breaker">Circuit Breaker</SelectItem>
                  <SelectItem value="bulkhead">Bulkhead</SelectItem>
                  <SelectItem value="retry">Retry</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                  <SelectItem value="rate-limiter">Rate Limiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={formData.enabled}
                onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
                data-testid="switch-pattern-enabled"
              />
              <Label>Enabled</Label>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Configuration</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(currentConfig).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Input
                    type="number"
                    value={value as number}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...currentConfig, [key]: parseInt(e.target.value) || 0 }
                    })}
                    data-testid={`input-${key}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{pattern ? "Update" : "Add"} Pattern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ObservabilityDialog({ isOpen, onClose, config, serviceId, serviceName, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  config: ObservabilityConfig | null;
  serviceId: string;
  serviceName: string;
  onSave: (config: ObservabilityConfig) => void;
}) {
  const [formData, setFormData] = useState<Partial<ObservabilityConfig>>(
    config || {
      metrics: { enabled: true, endpoint: "/metrics", scrapeInterval: "15s" },
      logging: { enabled: true, level: "info", format: "json" },
      tracing: { enabled: true, samplingRate: 0.1, exporter: "otlp" },
    }
  );

  const handleSave = () => {
    const newConfig: ObservabilityConfig = {
      id: config?.id || generateId(),
      serviceId,
      metrics: formData.metrics || { enabled: false },
      logging: formData.logging || { enabled: false, level: "info", format: "json" },
      tracing: formData.tracing || { enabled: false },
    };
    onSave(newConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{config ? "Edit" : "Add"} Observability: {serviceName}</DialogTitle>
          <DialogDescription>
            Configure metrics, logging, and distributed tracing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <Label className="font-medium">Metrics</Label>
              </div>
              <Switch
                checked={formData.metrics?.enabled}
                onCheckedChange={(enabled) => setFormData({
                  ...formData,
                  metrics: { ...formData.metrics!, enabled }
                })}
                data-testid="switch-metrics-enabled"
              />
            </div>
            {formData.metrics?.enabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Endpoint</Label>
                  <Input
                    value={formData.metrics.endpoint}
                    onChange={(e) => setFormData({
                      ...formData,
                      metrics: { ...formData.metrics!, endpoint: e.target.value }
                    })}
                    placeholder="/metrics"
                    data-testid="input-metrics-endpoint"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Scrape Interval</Label>
                  <Input
                    value={formData.metrics.scrapeInterval}
                    onChange={(e) => setFormData({
                      ...formData,
                      metrics: { ...formData.metrics!, scrapeInterval: e.target.value }
                    })}
                    placeholder="15s"
                    data-testid="input-metrics-interval"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Label className="font-medium">Logging</Label>
              </div>
              <Switch
                checked={formData.logging?.enabled}
                onCheckedChange={(enabled) => setFormData({
                  ...formData,
                  logging: { ...formData.logging!, enabled }
                })}
                data-testid="switch-logging-enabled"
              />
            </div>
            {formData.logging?.enabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Level</Label>
                  <Select
                    value={formData.logging.level}
                    onValueChange={(level: ObservabilityConfig["logging"]["level"]) => setFormData({
                      ...formData,
                      logging: { ...formData.logging!, level }
                    })}
                  >
                    <SelectTrigger data-testid="select-log-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warn</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Format</Label>
                  <Select
                    value={formData.logging.format}
                    onValueChange={(format: ObservabilityConfig["logging"]["format"]) => setFormData({
                      ...formData,
                      logging: { ...formData.logging!, format }
                    })}
                  >
                    <SelectTrigger data-testid="select-log-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4" />
                <Label className="font-medium">Distributed Tracing</Label>
              </div>
              <Switch
                checked={formData.tracing?.enabled}
                onCheckedChange={(enabled) => setFormData({
                  ...formData,
                  tracing: { ...formData.tracing!, enabled }
                })}
                data-testid="switch-tracing-enabled"
              />
            </div>
            {formData.tracing?.enabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1">
                  <Label className="text-xs">Sampling Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.tracing.samplingRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      tracing: { ...formData.tracing!, samplingRate: parseFloat(e.target.value) }
                    })}
                    data-testid="input-sampling-rate"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Exporter</Label>
                  <Select
                    value={formData.tracing.exporter}
                    onValueChange={(exporter: "jaeger" | "zipkin" | "otlp") => setFormData({
                      ...formData,
                      tracing: { ...formData.tracing!, exporter }
                    })}
                  >
                    <SelectTrigger data-testid="select-exporter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otlp">OTLP</SelectItem>
                      <SelectItem value="jaeger">Jaeger</SelectItem>
                      <SelectItem value="zipkin">Zipkin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{config ? "Update" : "Add"} Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PhaseDWorkspace() {
  const { 
    project, 
    addResiliencePattern,
    updateResiliencePattern,
    removeResiliencePattern,
    addObservabilityConfig,
    updateObservabilityConfig,
    removeObservabilityConfig,
    setPhase
  } = useProject();

  const [activeTab, setActiveTab] = useState("resilience");
  const [dialogType, setDialogType] = useState<"resilience" | "observability" | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [editingItem, setEditingItem] = useState<any>(null);

  if (!project) return null;

  const getServiceName = (serviceId: string) =>
    project.services.find(s => s.id === serviceId)?.name || "Unknown Service";

  const openDialog = (type: "resilience" | "observability", serviceId: string, item?: any) => {
    setDialogType(type);
    setSelectedServiceId(serviceId);
    setEditingItem(item || null);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedServiceId("");
    setEditingItem(null);
  };

  const totalConfigs = project.resiliencePatterns.length + project.observabilityConfigs.length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Phase D: Resilience & Observability</h2>
            <p className="text-muted-foreground mt-1">
              Add fault tolerance patterns and observability instrumentation
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resilience" data-testid="tab-resilience">
              Resilience Patterns
              {project.resiliencePatterns.length > 0 && (
                <Badge variant="secondary" className="ml-2">{project.resiliencePatterns.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="observability" data-testid="tab-observability">
              Observability
              {project.observabilityConfigs.length > 0 && (
                <Badge variant="secondary" className="ml-2">{project.observabilityConfigs.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="resilience" className="p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Fault Tolerance Patterns</h3>
              <Select onValueChange={(serviceId) => openDialog("resilience", serviceId)}>
                <SelectTrigger className="w-48" data-testid="select-add-resilience">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add pattern for..." />
                </SelectTrigger>
                <SelectContent>
                  {project.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.resiliencePatterns.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No resilience patterns configured</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Add circuit breakers, bulkheads, retries, and other patterns to improve fault tolerance.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.resiliencePatterns.map((pattern) => (
                  <ResilienceCard
                    key={pattern.id}
                    pattern={pattern}
                    serviceName={getServiceName(pattern.serviceId)}
                    onEdit={() => openDialog("resilience", pattern.serviceId, pattern)}
                    onDelete={() => removeResiliencePattern(pattern.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="observability" className="p-6 mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Observability Stack</h3>
              <Select onValueChange={(serviceId) => openDialog("observability", serviceId)}>
                <SelectTrigger className="w-48" data-testid="select-add-observability">
                  <Plus className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Add config for..." />
                </SelectTrigger>
                <SelectContent>
                  {project.services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {project.observabilityConfigs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No observability configured</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Configure metrics, logging, and distributed tracing for each service.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.observabilityConfigs.map((config) => (
                  <ObservabilityCard
                    key={config.id}
                    config={config}
                    serviceName={getServiceName(config.serviceId)}
                    onEdit={() => openDialog("observability", config.serviceId, config)}
                    onDelete={() => removeObservabilityConfig(config.id)}
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
            {totalConfigs === 0 
              ? "Add resilience patterns and observability configurations to complete your architecture"
              : `${project.resiliencePatterns.length} pattern${project.resiliencePatterns.length !== 1 ? 's' : ''}, ${project.observabilityConfigs.length} observability config${project.observabilityConfigs.length !== 1 ? 's' : ''}`
            }
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase("C")}>
              Back to Phase C
            </Button>
            <Button data-testid="button-complete-design">
              Complete Design
            </Button>
          </div>
        </div>
      </div>

      {dialogType === "resilience" && selectedServiceId && (
        <ResilienceDialog
          isOpen={true}
          onClose={closeDialog}
          pattern={editingItem}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={(pattern) => {
            if (editingItem) updateResiliencePattern(pattern.id, pattern);
            else addResiliencePattern(pattern);
            closeDialog();
          }}
        />
      )}

      {dialogType === "observability" && selectedServiceId && (
        <ObservabilityDialog
          isOpen={true}
          onClose={closeDialog}
          config={editingItem}
          serviceId={selectedServiceId}
          serviceName={getServiceName(selectedServiceId)}
          onSave={(config) => {
            if (editingItem) updateObservabilityConfig(config.id, config);
            else addObservabilityConfig(config);
            closeDialog();
          }}
        />
      )}
    </div>
  );
}
