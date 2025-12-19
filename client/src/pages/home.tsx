import { useState } from "react";
import { LandingPage } from "@/components/landing-page";
import { CaseStudies } from "@/components/case-studies";
import { AppHeader } from "@/components/app-header";
import { PhaseSidebar } from "@/components/phase-sidebar";
import { ValidationPanel } from "@/components/validation-panel";
import { PhaseAWorkspace } from "@/components/phases/phase-a-workspace";
import { PhaseBWorkspace } from "@/components/phases/phase-b-workspace";
import { PhaseCWorkspace } from "@/components/phases/phase-c-workspace";
import { PhaseDWorkspace } from "@/components/phases/phase-d-workspace";
import { useProject } from "@/lib/project-context";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = "landing" | "case-studies" | "workspace";

export default function Home() {
  const { project, currentPhase } = useProject();
  const [view, setView] = useState<View>("landing");

  // Show landing page when no project is active
  if (!project && view !== "case-studies") {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <LandingPage />
      </div>
    );
  }

  // Show case studies
  if (view === "case-studies") {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <CaseStudies onBack={() => setView("landing")} />
      </div>
    );
  }

  // Show workspace when project is active
  const renderPhaseWorkspace = () => {
    switch (currentPhase) {
      case "A":
        return <PhaseAWorkspace />;
      case "B":
        return <PhaseBWorkspace />;
      case "C":
        return <PhaseCWorkspace />;
      case "D":
        return <PhaseDWorkspace />;
      default:
        return <PhaseAWorkspace />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <PhaseSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderPhaseWorkspace()}
        </main>
        <aside className="w-80 border-l bg-background p-4 hidden xl:block">
          <ScrollArea className="h-full">
            <ValidationPanel />
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
