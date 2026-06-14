import {
  MissionInputs,
  MissionCalculations,
  formatMass,
  formatNumber,
  formatPercent,
  formatTime,
  formatVelocity,
} from "@shared/propulsion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  Fuel, 
  Timer, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Calculator,
  PieChart,
  Target
} from "lucide-react";

interface ResultsDashboardProps {
  inputs: MissionInputs;
  results: MissionCalculations;
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  // Simple feasibility check
  const isFeasible = results.propellantFraction < 0.9;
  const propellantWarning = results.propellantFraction > 0.85;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Initial Mass"
          value={formatMass(results.initialMass)}
          icon={<Scale className="w-4 h-4" />}
          description="Total takeoff mass"
        />
        <SummaryCard
          title="Propellant"
          value={formatMass(results.propellantMass)}
          icon={<Fuel className="w-4 h-4" />}
          description={`${formatPercent(results.propellantFraction)} of total`}
        />
        <SummaryCard
          title="Transit Time"
          value={formatTime(results.estimatedTransitTime)}
          icon={<Timer className="w-4 h-4" />}
          description="Est. Earth-Mars"
        />
        <SummaryCard
          title="Eff. Isp"
          value={`${results.isp}s`}
          icon={<Zap className="w-4 h-4" />}
          description="Specific Impulse"
        />
      </div>

      {/* Detailed Analysis */}
      <Card className="card-elevated border-none overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Mission Analysis
              </CardTitle>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isFeasible 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {isFeasible ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Feasible</>
              ) : (
                <><AlertTriangle className="w-3.5 h-3.5" /> High Risk</>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-6 gap-6">
              <TabsTrigger value="breakdown" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Mass Breakdown
              </TabsTrigger>
              <TabsTrigger value="fractions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-semibold flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Mass Fractions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="p-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <ResultRow label="Payload Mass" value={formatMass(results.initialMass * results.payloadFraction)} />
                  <ResultRow label="Dry Mass" value={formatMass(results.initialMass * results.dryMassFraction)} />
                  <ResultRow label="Propellant Mass" value={formatMass(results.propellantMass)} />
                  <div className="pt-2 border-t border-border/50">
                    <ResultRow label="Total Initial Mass" value={formatMass(results.initialMass)} highlight />
                  </div>
                </div>
                <div className="space-y-4">
                  <ResultRow label="Mass Ratio (m₀/mf)" value={formatNumber(results.massRatio)} />
                  <ResultRow label="Effective Exhaust Velocity" value={formatVelocity(results.isp * 9.81)} />
                  <ResultRow label="Propellant Fraction" value={formatPercent(results.propellantFraction)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fractions" className="p-6 m-0 space-y-8">
              <div className="space-y-6">
                <MassFractionBar
                  label="Propellant"
                  fraction={results.propellantFraction}
                  color="bg-primary"
                  icon={<Fuel className="w-3.5 h-3.5" />}
                />
                <MassFractionBar
                  label="Dry Mass"
                  fraction={results.dryMassFraction}
                  color="bg-orange-500"
                  icon={<Scale className="w-3.5 h-3.5" />}
                />
                <MassFractionBar
                  label="Payload"
                  fraction={results.payloadFraction}
                  color="bg-green-500"
                  icon={<Target className="w-3.5 h-3.5" />}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feasibility Message */}
      <div className={`p-4 rounded-xl border flex gap-4 ${
        isFeasible 
          ? "bg-green-50/50 border-green-100 text-green-800 dark:bg-green-900/10 dark:border-green-900/20 dark:text-green-300" 
          : "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-300"
      }`}>
        <div className={`p-2 rounded-lg h-fit ${isFeasible ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {isFeasible ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm">Mission Status: {isFeasible ? "Optimized" : "Critical"}</h4>
          <p className="text-xs opacity-90 leading-relaxed">
            {isFeasible
              ? propellantWarning
                ? "The mission is feasible, but the propellant fraction is high (>85%). Consider using a more efficient propulsion system or reducing dry mass to increase safety margins."
                : "This configuration is highly efficient and well within typical mission design margins. The mass ratio is favorable for a Mars transfer."
              : "Massive propellant requirements detected. The mass ratio exceeds practical limits for a single-stage vehicle. Consider orbital assembly, refueling, or high-Isp nuclear propulsion."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, description }: { title: string; value: string; icon: React.ReactNode; description: string }) {
  return (
    <Card className="card-elevated border-none bg-card/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-xl font-bold tracking-tight">{value}</div>
          <p className="text-[10px] text-muted-foreground font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${highlight ? "font-bold text-foreground" : "text-muted-foreground font-medium"}`}>{label}</span>
      <span className={`font-mono text-sm ${highlight ? "font-bold text-primary" : "font-semibold"}`}>{value}</span>
    </div>
  );
}

function MassFractionBar({ label, fraction, color, icon }: { label: string; fraction: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${color.replace('bg-', 'bg-').replace('500', '100')} ${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
          <span className="text-sm font-bold">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold">{formatPercent(fraction)}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{formatNumber(fraction, 3)}</span>
        </div>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
