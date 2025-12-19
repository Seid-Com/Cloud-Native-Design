import { CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/project-context";
import type { ValidationResult, AIRecommendation } from "@shared/schema";
import { useState } from "react";

function ValidationItem({ result }: { result: ValidationResult }) {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    passed: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
    warning: { icon: AlertTriangle, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
    failed: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button 
          className={cn(
            "w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors",
            config.bg,
            "hover-elevate"
          )}
          data-testid={`validation-item-${result.id}`}
        >
          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{result.message}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {result.category}
              </Badge>
            </div>
          </div>
          {result.details && (
            isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> 
                   : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      {result.details && (
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 ml-7">
            <p className="text-sm text-muted-foreground">{result.details}</p>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function RecommendationItem({ recommendation, onAccept, onDismiss }: { 
  recommendation: AIRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const severityConfig = {
    info: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", badge: "default" },
    warning: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30", badge: "secondary" },
    error: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", badge: "destructive" },
  } as const;

  const config = severityConfig[recommendation.severity];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-md", config.bg)}>
        <CollapsibleTrigger asChild>
          <button 
            className="w-full flex items-start gap-3 p-3 text-left hover-elevate rounded-md"
            data-testid={`recommendation-item-${recommendation.id}`}
          >
            <Sparkles className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{recommendation.title}</span>
                <Badge variant={config.badge as "default" | "secondary" | "destructive"} className="text-xs">
                  {recommendation.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {recommendation.description}
              </p>
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> 
                    : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 ml-7 space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rationale</span>
              <p className="text-sm mt-1">{recommendation.rationale}</p>
            </div>
            {recommendation.suggestedAction && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggested Action</span>
                <p className="text-sm mt-1">{recommendation.suggestedAction}</p>
              </div>
            )}
            {recommendation.actionable && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={onAccept} data-testid={`button-accept-${recommendation.id}`}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={onDismiss} data-testid={`button-dismiss-${recommendation.id}`}>
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function ValidationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

export function ValidationPanel() {
  const { 
    validationResults, 
    recommendations, 
    currentPhase, 
    project,
    isValidating,
    isGeneratingRecommendations,
    runValidation,
    fetchRecommendations
  } = useProject();

  const phaseResults = validationResults.filter(r => r.phase === currentPhase);
  const passedCount = phaseResults.filter(r => r.status === "passed").length;
  const warningCount = phaseResults.filter(r => r.status === "warning").length;
  const failedCount = phaseResults.filter(r => r.status === "failed").length;

  const hasProject = !!project;

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Validation Status
            </CardTitle>
            {hasProject && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={runValidation}
                disabled={isValidating}
                data-testid="button-refresh-validation"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">{passedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">{warningCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">{failedCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Checks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-48 px-4 pb-4">
            {isValidating ? (
              <ValidationSkeleton />
            ) : phaseResults.length > 0 ? (
              <div className="space-y-2">
                {phaseResults.map((result) => (
                  <ValidationItem key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {hasProject 
                    ? "Add services and configurations to see validation results."
                    : "Create a project to start validation."}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Recommendations
            </CardTitle>
            {hasProject && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={fetchRecommendations}
                disabled={isGeneratingRecommendations}
                data-testid="button-get-recommendations"
              >
                {isGeneratingRecommendations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Tips
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64 px-4 pb-4">
            {isGeneratingRecommendations ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <RecommendationItem key={rec.id} recommendation={rec} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {hasProject 
                    ? "Click 'Get Tips' to receive AI-powered architecture recommendations."
                    : "Create a project to get AI recommendations."}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
