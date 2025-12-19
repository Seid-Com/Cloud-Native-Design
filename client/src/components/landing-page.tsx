import { Cloud, Layers, Box, Settings, Shield, ArrowRight, BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/lib/project-context";

const features = [
  {
    icon: Layers,
    title: "Domain-Driven Decomposition",
    description: "Break down your system into bounded contexts and microservices using DDD principles",
    phase: "Phase A",
  },
  {
    icon: Box,
    title: "Container Configuration",
    description: "Generate optimized Dockerfiles with multi-stage builds and security best practices",
    phase: "Phase B",
  },
  {
    icon: Settings,
    title: "SLO-Driven Orchestration",
    description: "Define service level objectives and configure autoscaling strategies",
    phase: "Phase C",
  },
  {
    icon: Shield,
    title: "Resilience Patterns",
    description: "Add circuit breakers, bulkheads, retries, and observability instrumentation",
    phase: "Phase D",
  },
];

const metrics = [
  { value: "41.7%", label: "p95 Latency Reduction" },
  { value: "130.7%", label: "Throughput Increase" },
  { value: "66.7%", label: "MTTR Reduction" },
  { value: "99.9%", label: "Availability Target" },
];

const caseStudies = [
  {
    title: "E-Commerce Platform",
    description: "Full-stack retail system with order management, inventory, and payment processing",
    services: 12,
    improvement: "2.4x faster response times",
  },
  {
    title: "IoT Data Pipeline",
    description: "Real-time sensor data ingestion, processing, and analytics platform",
    services: 8,
    improvement: "3x throughput increase",
  },
];

export function LandingPage() {
  const { createProject } = useProject();

  const handleQuickStart = () => {
    createProject("My Cloud Architecture", "A new cloud-native architecture design");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center py-16">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
              <Cloud className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            CloudArch++
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A systematic framework for designing cloud-native software architectures with 
            integrated operational outcomes and AI-powered recommendations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" onClick={handleQuickStart} data-testid="button-quick-start">
              Start Designing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" data-testid="button-view-case-studies">
              <BookOpen className="mr-2 h-4 w-4" />
              View Case Studies
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary">Domain-Driven Design</Badge>
            <Badge variant="secondary">Kubernetes</Badge>
            <Badge variant="secondary">Microservices</Badge>
            <Badge variant="secondary">SRE Principles</Badge>
          </div>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-primary mb-1">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold mb-3">Four-Phase Framework</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              CloudArch++ guides you through a structured process that connects 
              design-time decisions with runtime reliability requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative overflow-visible">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline">{feature.phase}</Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="py-12">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold mb-3">AI-Powered Recommendations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get intelligent suggestions for service decomposition, pattern selection, 
              and anti-pattern detection powered by advanced language models.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Decomposition Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Identify optimal service boundaries based on domain events and data ownership
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Pattern Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically suggest resilience patterns based on service interactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Anti-Pattern Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get warnings about chatty services, circular dependencies, and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold mb-3">Validated Case Studies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-world implementations demonstrating measurable improvements 
              in latency, availability, and operational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {caseStudies.map((study, index) => (
              <Card key={index} className="hover-elevate cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-lg">{study.title}</CardTitle>
                    <Badge>{study.services} services</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {study.description}
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{study.improvement}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-semibold mb-3">Ready to design your architecture?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Start with the CloudArch++ framework and build resilient, 
                scalable cloud-native systems with confidence.
              </p>
              <Button size="lg" onClick={handleQuickStart} data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="py-8 border-t text-center text-sm text-muted-foreground">
          <p>
            CloudArch++ Framework - Based on research by Seid Mehammed, Md Nasre Alam, and Shakir Khan
          </p>
        </footer>
      </div>
    </div>
  );
}
