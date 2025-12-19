import { Layers, Box, Settings, Shield, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/project-context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Phase = "A" | "B" | "C" | "D";

interface PhaseInfo {
  id: Phase;
  label: string;
  title: string;
  description: string;
  icon: typeof Layers;
}

const phases: PhaseInfo[] = [
  { 
    id: "A", 
    label: "Phase A", 
    title: "Domain Decomposition", 
    description: "Define bounded contexts and services using DDD principles",
    icon: Layers 
  },
  { 
    id: "B", 
    label: "Phase B", 
    title: "Containerization", 
    description: "Configure container builds and deployment artifacts",
    icon: Box 
  },
  { 
    id: "C", 
    label: "Phase C", 
    title: "Orchestration & Scaling", 
    description: "Set up SLOs, autoscaling, and Kubernetes manifests",
    icon: Settings 
  },
  { 
    id: "D", 
    label: "Phase D", 
    title: "Resilience & Observability", 
    description: "Add circuit breakers, retries, metrics, and tracing",
    icon: Shield 
  },
];

const phaseOrder: Phase[] = ["A", "B", "C", "D"];

export function PhaseSidebar() {
  const { currentPhase, setPhase, canAdvanceToPhase, project } = useProject();

  if (!project) return null;

  const getPhaseStatus = (phase: Phase): "completed" | "current" | "upcoming" => {
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phase);
    
    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getPhaseItemCount = (phase: Phase): number => {
    switch (phase) {
      case "A":
        return project.services.length;
      case "B":
        return project.containerConfigs.length;
      case "C":
        return project.k8sManifests.length;
      case "D":
        return project.resiliencePatterns.length + project.observabilityConfigs.length;
      default:
        return 0;
    }
  };

  const handlePhaseClick = (phase: Phase) => {
    const phaseIndex = phaseOrder.indexOf(phase);
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    if (phaseIndex <= currentIndex || canAdvanceToPhase(phase)) {
      setPhase(phase);
    }
  };

  return (
    <aside className="w-64 border-r bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Framework Phases
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {phases.map((phase) => {
            const status = getPhaseStatus(phase.id);
            const Icon = phase.icon;
            const itemCount = getPhaseItemCount(phase.id);
            const isClickable = phaseOrder.indexOf(phase.id) <= phaseOrder.indexOf(currentPhase) || 
                               canAdvanceToPhase(phase.id);

            return (
              <button
                key={phase.id}
                onClick={() => handlePhaseClick(phase.id)}
                disabled={!isClickable}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-md text-left transition-all duration-200",
                  status === "current" && "bg-sidebar-accent",
                  status === "completed" && "opacity-90",
                  status === "upcoming" && "opacity-50",
                  isClickable && status !== "current" && "hover-elevate cursor-pointer",
                  !isClickable && "cursor-not-allowed"
                )}
                data-testid={`sidebar-phase-${phase.id}`}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md shrink-0",
                  status === "current" && "bg-primary text-primary-foreground",
                  status === "completed" && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                  status === "upcoming" && "bg-muted text-muted-foreground"
                )}>
                  {status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      status === "current" && "text-sidebar-accent-foreground"
                    )}>
                      {phase.title}
                    </span>
                    {itemCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {phase.description}
                  </p>
                </div>

                {status === "current" && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-2" />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">{project.name}</p>
          <p className="truncate">{project.description || "No description"}</p>
        </div>
      </div>
    </aside>
  );
}
