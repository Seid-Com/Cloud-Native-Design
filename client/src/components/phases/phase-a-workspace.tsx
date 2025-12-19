import { useState } from "react";
import { Plus, Trash2, Edit2, Link2, Database, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProject } from "@/lib/project-context";
import type { Service, BoundedContext } from "@shared/schema";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function ServiceCard({ service, onEdit, onDelete }: { 
  service: Service; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const communicationIcons = {
    "sync": Link2,
    "async": MessageSquare,
    "event-driven": Zap,
  };
  const CommIcon = communicationIcons[service.communicationType];

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{service.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {service.boundedContext || "No context assigned"}
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onEdit}
              data-testid={`button-edit-service-${service.id}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onDelete}
              data-testid={`button-delete-service-${service.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {service.description || "No description"}
        </p>
        
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            <CommIcon className="h-3 w-3 mr-1" />
            {service.communicationType}
          </Badge>
          {service.dataOwnership.slice(0, 2).map((data, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              {data}
            </Badge>
          ))}
          {service.dataOwnership.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{service.dataOwnership.length - 2}
            </Badge>
          )}
        </div>

        {service.dependencies.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1.5">Dependencies:</p>
            <div className="flex flex-wrap gap-1">
              {service.dependencies.map((dep, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BoundedContextCard({ context, services, onEdit, onDelete }: {
  context: BoundedContext;
  services: Service[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const contextServices = services.filter(s => s.boundedContext === context.name);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{context.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {contextServices.length} service{contextServices.length !== 1 ? 's' : ''}
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
        <p className="text-sm text-muted-foreground line-clamp-2">
          {context.description || "No description"}
        </p>
        
        {context.aggregates.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Aggregates:</p>
            <div className="flex flex-wrap gap-1">
              {context.aggregates.map((agg, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{agg}</Badge>
              ))}
            </div>
          </div>
        )}

        {context.domainEvents.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Domain Events:</p>
            <div className="flex flex-wrap gap-1">
              {context.domainEvents.map((event, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {event}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceDialog({ 
  isOpen, 
  onClose, 
  service, 
  contexts,
  existingServices,
  onSave 
}: {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  contexts: BoundedContext[];
  existingServices: Service[];
  onSave: (service: Service) => void;
}) {
  const [formData, setFormData] = useState<Partial<Service>>(
    service || {
      name: "",
      description: "",
      boundedContext: "",
      responsibilities: [],
      dependencies: [],
      communicationType: "sync",
      dataOwnership: [],
    }
  );
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    service?.responsibilities.join("\n") || ""
  );
  const [dataOwnershipText, setDataOwnershipText] = useState(
    service?.dataOwnership.join(", ") || ""
  );

  const handleSave = () => {
    const newService: Service = {
      id: service?.id || generateId(),
      name: formData.name || "",
      description: formData.description || "",
      boundedContext: formData.boundedContext || "",
      responsibilities: responsibilitiesText.split("\n").filter(r => r.trim()),
      dependencies: formData.dependencies || [],
      communicationType: formData.communicationType || "sync",
      dataOwnership: dataOwnershipText.split(",").map(d => d.trim()).filter(d => d),
    };
    onSave(newService);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            Define a microservice with its responsibilities, data ownership, and communication patterns.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Service Name</Label>
            <Input
              id="service-name"
              placeholder="e.g., OrderService"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-service-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              placeholder="What does this service do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              data-testid="input-service-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bounded-context">Bounded Context</Label>
            <Select
              value={formData.boundedContext}
              onValueChange={(value) => setFormData({ ...formData, boundedContext: value })}
            >
              <SelectTrigger data-testid="select-bounded-context">
                <SelectValue placeholder="Select a bounded context" />
              </SelectTrigger>
              <SelectContent>
                {contexts.map((ctx) => (
                  <SelectItem key={ctx.id} value={ctx.name}>
                    {ctx.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-type">Communication Type</Label>
            <Select
              value={formData.communicationType}
              onValueChange={(value: "sync" | "async" | "event-driven") => 
                setFormData({ ...formData, communicationType: value })
              }
            >
              <SelectTrigger data-testid="select-communication-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sync">Synchronous (REST/gRPC)</SelectItem>
                <SelectItem value="async">Asynchronous (Message Queue)</SelectItem>
                <SelectItem value="event-driven">Event-Driven (Pub/Sub)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
            <Textarea
              id="responsibilities"
              placeholder="Handle order creation&#10;Process payments&#10;Send notifications"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              rows={3}
              data-testid="input-responsibilities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-ownership">Data Ownership (comma-separated)</Label>
            <Input
              id="data-ownership"
              placeholder="e.g., orders, order_items"
              value={dataOwnershipText}
              onChange={(e) => setDataOwnershipText(e.target.value)}
              data-testid="input-data-ownership"
            />
          </div>

          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex flex-wrap gap-2">
              {existingServices
                .filter(s => s.id !== service?.id)
                .map((s) => (
                  <Badge
                    key={s.id}
                    variant={formData.dependencies?.includes(s.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const deps = formData.dependencies || [];
                      if (deps.includes(s.name)) {
                        setFormData({ ...formData, dependencies: deps.filter(d => d !== s.name) });
                      } else {
                        setFormData({ ...formData, dependencies: [...deps, s.name] });
                      }
                    }}
                  >
                    {s.name}
                  </Badge>
                ))}
              {existingServices.filter(s => s.id !== service?.id).length === 0 && (
                <p className="text-sm text-muted-foreground">No other services defined yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!formData.name?.trim()}>
            {service ? "Update" : "Add"} Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContextDialog({
  isOpen,
  onClose,
  context,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  context: BoundedContext | null;
  onSave: (context: BoundedContext) => void;
}) {
  const [formData, setFormData] = useState<Partial<BoundedContext>>(
    context || {
      name: "",
      description: "",
      domainEvents: [],
      aggregates: [],
      services: [],
    }
  );
  const [aggregatesText, setAggregatesText] = useState(
    context?.aggregates.join(", ") || ""
  );
  const [eventsText, setEventsText] = useState(
    context?.domainEvents.join(", ") || ""
  );

  const handleSave = () => {
    const newContext: BoundedContext = {
      id: context?.id || generateId(),
      name: formData.name || "",
      description: formData.description || "",
      domainEvents: eventsText.split(",").map(e => e.trim()).filter(e => e),
      aggregates: aggregatesText.split(",").map(a => a.trim()).filter(a => a),
      services: context?.services || [],
    };
    onSave(newContext);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{context ? "Edit Bounded Context" : "Add Bounded Context"}</DialogTitle>
          <DialogDescription>
            Define a bounded context that groups related domain concepts and services.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="context-name">Context Name</Label>
            <Input
              id="context-name"
              placeholder="e.g., Order Management"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-context-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context-description">Description</Label>
            <Textarea
              id="context-description"
              placeholder="Describe the domain this context covers"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              data-testid="input-context-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggregates">Aggregates (comma-separated)</Label>
            <Input
              id="aggregates"
              placeholder="e.g., Order, OrderItem, Customer"
              value={aggregatesText}
              onChange={(e) => setAggregatesText(e.target.value)}
              data-testid="input-aggregates"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain-events">Domain Events (comma-separated)</Label>
            <Input
              id="domain-events"
              placeholder="e.g., OrderCreated, OrderShipped"
              value={eventsText}
              onChange={(e) => setEventsText(e.target.value)}
              data-testid="input-domain-events"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!formData.name?.trim()}>
            {context ? "Update" : "Add"} Context
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PhaseAWorkspace() {
  const { 
    project, 
    addBoundedContext, 
    updateBoundedContext, 
    removeBoundedContext,
    addService,
    updateService,
    removeService,
    setPhase,
    canAdvanceToPhase
  } = useProject();

  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isContextDialogOpen, setIsContextDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingContext, setEditingContext] = useState<BoundedContext | null>(null);

  if (!project) return null;

  const handleSaveService = (service: Service) => {
    if (editingService) {
      updateService(service.id, service);
    } else {
      addService(service);
    }
    setEditingService(null);
  };

  const handleSaveContext = (context: BoundedContext) => {
    if (editingContext) {
      updateBoundedContext(context.id, context);
    } else {
      addBoundedContext(context);
    }
    setEditingContext(null);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceDialogOpen(true);
  };

  const handleEditContext = (context: BoundedContext) => {
    setEditingContext(context);
    setIsContextDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Phase A: Domain-Driven Decomposition</h2>
            <p className="text-muted-foreground mt-1">
              Define bounded contexts and decompose your system into microservices
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingContext(null);
                setIsContextDialogOpen(true);
              }}
              data-testid="button-add-context"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Context
            </Button>
            <Button
              onClick={() => {
                setEditingService(null);
                setIsServiceDialogOpen(true);
              }}
              data-testid="button-add-service"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {project.boundedContexts.length > 0 && (
            <section>
              <h3 className="text-lg font-medium mb-4">Bounded Contexts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.boundedContexts.map((context) => (
                  <BoundedContextCard
                    key={context.id}
                    context={context}
                    services={project.services}
                    onEdit={() => handleEditContext(context)}
                    onDelete={() => removeBoundedContext(context.id)}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-medium mb-4">
              Microservices
              {project.services.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {project.services.length}
                </Badge>
              )}
            </h3>
            
            {project.services.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No services defined yet</h4>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Start by adding bounded contexts to organize your domain, then define 
                    microservices with their responsibilities and data ownership.
                  </p>
                  <Button
                    onClick={() => {
                      setEditingService(null);
                      setIsServiceDialogOpen(true);
                    }}
                    data-testid="button-add-first-service"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={() => handleEditService(service)}
                    onDelete={() => removeService(service.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {project.services.length === 0 
              ? "Add at least one service to proceed to Phase B"
              : `${project.services.length} service${project.services.length > 1 ? 's' : ''} defined`
            }
          </p>
          <Button
            onClick={() => setPhase("B")}
            disabled={!canAdvanceToPhase("B")}
            data-testid="button-proceed-phase-b"
          >
            Continue to Containerization
          </Button>
        </div>
      </div>

      <ServiceDialog
        isOpen={isServiceDialogOpen}
        onClose={() => {
          setIsServiceDialogOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        contexts={project.boundedContexts}
        existingServices={project.services}
        onSave={handleSaveService}
      />

      <ContextDialog
        isOpen={isContextDialogOpen}
        onClose={() => {
          setIsContextDialogOpen(false);
          setEditingContext(null);
        }}
        context={editingContext}
        onSave={handleSaveContext}
      />
    </div>
  );
}
