import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CaseStudyMetrics } from "@shared/schema";

const caseStudies: CaseStudyMetrics[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    domain: "e-commerce",
    baseline: {
      p95Latency: 480,
      availability: 99.2,
      throughput: 1200,
      mttr: 45,
    },
    optimized: {
      p95Latency: 280,
      availability: 99.95,
      throughput: 2768,
      mttr: 15,
    },
    improvements: {
      latencyReduction: 41.7,
      availabilityIncrease: 0.75,
      throughputIncrease: 130.7,
      mttrReduction: 66.7,
    },
  },
  {
    id: "iot-pipeline",
    name: "IoT Data Pipeline",
    domain: "iot-pipeline",
    baseline: {
      p95Latency: 320,
      availability: 99.5,
      throughput: 5000,
      mttr: 30,
    },
    optimized: {
      p95Latency: 120,
      availability: 99.99,
      throughput: 15000,
      mttr: 8,
    },
    improvements: {
      latencyReduction: 62.5,
      availabilityIncrease: 0.49,
      throughputIncrease: 200,
      mttrReduction: 73.3,
    },
  },
];

const ecommerceServices = [
  { name: "API Gateway", context: "Infrastructure", type: "Gateway" },
  { name: "User Service", context: "Identity", type: "Microservice" },
  { name: "Product Catalog", context: "Inventory", type: "Microservice" },
  { name: "Order Service", context: "Order Management", type: "Microservice" },
  { name: "Payment Service", context: "Payments", type: "Microservice" },
  { name: "Inventory Service", context: "Inventory", type: "Microservice" },
  { name: "Notification Service", context: "Communication", type: "Microservice" },
  { name: "Cart Service", context: "Order Management", type: "Microservice" },
  { name: "Search Service", context: "Discovery", type: "Microservice" },
  { name: "Recommendation Engine", context: "Discovery", type: "Microservice" },
  { name: "Analytics Service", context: "Reporting", type: "Microservice" },
  { name: "Shipping Service", context: "Fulfillment", type: "Microservice" },
];

const iotServices = [
  { name: "Ingestion Gateway", context: "Data Ingestion", type: "Gateway" },
  { name: "Device Registry", context: "Device Management", type: "Microservice" },
  { name: "Stream Processor", context: "Data Processing", type: "Microservice" },
  { name: "Time Series DB", context: "Storage", type: "Database" },
  { name: "Analytics Engine", context: "Analytics", type: "Microservice" },
  { name: "Alert Manager", context: "Monitoring", type: "Microservice" },
  { name: "Dashboard Service", context: "Visualization", type: "Microservice" },
  { name: "Config Service", context: "Device Management", type: "Microservice" },
];

function MetricCard({ 
  label, 
  baseline, 
  optimized, 
  unit, 
  improvement, 
  isReduction 
}: {
  label: string;
  baseline: number;
  optimized: number;
  unit: string;
  improvement: number;
  isReduction?: boolean;
}) {
  const Icon = isReduction ? TrendingDown : TrendingUp;
  const colorClass = "text-green-600 dark:text-green-400";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Baseline</p>
            <p className="text-lg font-semibold text-muted-foreground line-through">
              {baseline}{unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Optimized</p>
            <p className="text-2xl font-bold">
              {optimized}{unit}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${colorClass}`}>
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {improvement.toFixed(1)}% {isReduction ? "reduction" : "increase"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CaseStudyDetail({ study }: { study: CaseStudyMetrics }) {
  const services = study.domain === "e-commerce" ? ecommerceServices : iotServices;
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="p95 Latency"
          baseline={study.baseline.p95Latency}
          optimized={study.optimized.p95Latency}
          unit="ms"
          improvement={study.improvements.latencyReduction}
          isReduction
        />
        <MetricCard
          label="Availability"
          baseline={study.baseline.availability}
          optimized={study.optimized.availability}
          unit="%"
          improvement={study.improvements.availabilityIncrease}
        />
        <MetricCard
          label="Throughput"
          baseline={study.baseline.throughput}
          optimized={study.optimized.throughput}
          unit=" req/s"
          improvement={study.improvements.throughputIncrease}
        />
        <MetricCard
          label="MTTR"
          baseline={study.baseline.mttr}
          optimized={study.optimized.mttr}
          unit=" min"
          improvement={study.improvements.mttrReduction}
          isReduction
        />
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-4">Service Architecture</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service, index) => (
            <Card key={index} className="hover-elevate">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Server className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.context}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{service.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Framework Application</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Phase A: Domain Decomposition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Bounded contexts identified using DDD</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Event-driven communication patterns applied</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Data ownership clearly defined per service</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Phase B: Containerization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Multi-stage Docker builds for all services</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Alpine-based images for reduced footprint</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Health checks configured for all containers</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Phase C: Orchestration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">SLOs defined for critical paths</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">HPA configured with custom metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Rolling update strategy with canary testing</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Phase D: Resilience & Observability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Circuit breakers on all external calls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Distributed tracing with OpenTelemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">Prometheus metrics + Grafana dashboards</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

interface CaseStudiesProps {
  onBack: () => void;
}

export function CaseStudies({ onBack }: CaseStudiesProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Case Studies</h1>
            <p className="text-muted-foreground mt-1">
              Real-world implementations demonstrating CloudArch++ framework effectiveness
            </p>
          </div>
        </div>

        <Tabs defaultValue="ecommerce">
          <TabsList className="mb-6">
            <TabsTrigger value="ecommerce" data-testid="tab-ecommerce">
              <Zap className="h-4 w-4 mr-2" />
              E-Commerce Platform
            </TabsTrigger>
            <TabsTrigger value="iot" data-testid="tab-iot">
              <Server className="h-4 w-4 mr-2" />
              IoT Data Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ecommerce">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-xl">E-Commerce Platform</CardTitle>
                    <CardDescription className="mt-1">
                      Full-stack retail system with order management, inventory, and payment processing
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{ecommerceServices.length} services</Badge>
                    <Badge variant="outline">6 bounded contexts</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <CaseStudyDetail study={caseStudies[0]} />
          </TabsContent>

          <TabsContent value="iot">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-xl">IoT Data Pipeline</CardTitle>
                    <CardDescription className="mt-1">
                      Real-time sensor data ingestion, processing, and analytics platform
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{iotServices.length} services</Badge>
                    <Badge variant="outline">5 bounded contexts</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <CaseStudyDetail study={caseStudies[1]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
