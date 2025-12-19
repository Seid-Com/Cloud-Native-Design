import { Check, Layers, Box, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/project-context";

type Phase = "A" | "B" | "C" | "D";

interface PhaseInfo {
  id: Phase;
  label: string;
  title: string;
  icon: typeof Layers;
}

const phases: PhaseInfo[] = [
  { id: "A", label: "Phase A", title: "Domain Decomposition", icon: Layers },
  { id: "B", label: "Phase B", title: "Containerization", icon: Box },
  { id: "C", label: "Phase C", title: "Orchestration", icon: Settings },
  { id: "D", label: "Phase D", title: "Resilience", icon: Shield },
];

const phaseOrder: Phase[] = ["A", "B", "C", "D"];

export function PhaseProgress() {
  const { currentPhase, setPhase, canAdvanceToPhase, project } = useProject();

  const getPhaseStatus = (phase: Phase): "completed" | "current" | "upcoming" => {
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phase);
    
    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "current";
    return "upcoming";
  };

  const handlePhaseClick = (phase: Phase) => {
    const phaseIndex = phaseOrder.indexOf(phase);
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    if (phaseIndex <= currentIndex || canAdvanceToPhase(phase)) {
      setPhase(phase);
    }
  };

  if (!project) return null;

  return (
    <div className="flex items-center gap-2">
      {phases.map((phase, index) => {
        const status = getPhaseStatus(phase.id);
        const Icon = phase.icon;
        const isClickable = phaseOrder.indexOf(phase.id) <= phaseOrder.indexOf(currentPhase) || 
                           canAdvanceToPhase(phase.id);

        return (
          <div key={phase.id} className="flex items-center">
            <button
              onClick={() => handlePhaseClick(phase.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200",
                status === "current" && "bg-primary text-primary-foreground",
                status === "completed" && "bg-accent text-accent-foreground",
                status === "upcoming" && "text-muted-foreground",
                isClickable && status !== "current" && "hover-elevate cursor-pointer",
                !isClickable && "opacity-50 cursor-not-allowed"
              )}
              data-testid={`button-phase-${phase.id}`}
            >
              {status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium hidden md:inline">{phase.title}</span>
              <span className="text-sm font-medium md:hidden">{phase.label}</span>
            </button>
            
            {index < phases.length - 1 && (
              <div 
                className={cn(
                  "w-8 h-0.5 mx-1",
                  status === "completed" ? "bg-primary/60" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
