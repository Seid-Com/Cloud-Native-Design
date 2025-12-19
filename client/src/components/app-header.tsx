import { Cloud, Download, Save, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PhaseProgress } from "@/components/phase-progress";
import { useProject } from "@/lib/project-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function AppHeader() {
  const { project, createProject, resetProject } = useProject();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = () => {
    if (projectName.trim()) {
      createProject(projectName.trim(), projectDescription.trim());
      setIsNewProjectOpen(false);
      setProjectName("");
      setProjectDescription("");
    }
  };

  const handleExport = () => {
    if (!project) return;
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-architecture.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Cloud className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-tight">CloudArch++</span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                Architecture Framework
              </span>
            </div>
          </div>
        </div>

        {project && (
          <div className="flex-1 flex justify-center">
            <PhaseProgress />
          </div>
        )}

        <div className="flex items-center gap-2">
          {project ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleExport}
                data-testid="button-export"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetProject}
                data-testid="button-close-project"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Close Project</span>
              </Button>
            </>
          ) : (
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-project">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Architecture Project</DialogTitle>
                  <DialogDescription>
                    Start designing your cloud-native architecture with the CloudArch++ framework.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="e.g., E-Commerce Platform"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      data-testid="input-project-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description (optional)</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Brief description of your system..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                      data-testid="input-project-description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNewProjectOpen(false)}
                    data-testid="button-cancel-project"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProject}
                    disabled={!projectName.trim()}
                    data-testid="button-create-project"
                  >
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
