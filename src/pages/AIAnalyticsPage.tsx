import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  BedDouble,
  Receipt,
  Pill,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
} from 'lucide-react';
import { usePharmacyAI } from '@/hooks/usePharmacyAI';
import { AIInsightsPanel } from '@/components/pharmacy/AIInsightsPanel';
import { StatCard } from '@/components/shared/StatCard';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AIAnalyticsPage: React.FC = () => {
  const { analyze, isLoading, result, error } = usePharmacyAI();

  useEffect(() => {
    // Auto-analyze on mount
    analyze('all');
  }, []);

  const insights = result?.insights;
  const snapshot = result?.dataSnapshot;

  // Prepare chart data
  const demandChartData = insights?.demandForecast?.slice(0, 8).map(f => ({
    name: f.medicineName.split(' ')[0],
    stock: f.currentStock,
    demand: f.predictedDemand7Days,
  })) || [];

  const expiryPieData = [
    { name: 'High Risk', value: insights?.expiryRisks?.filter(r => r.riskLevel === 'high').length || 0 },
    { name: 'Medium Risk', value: insights?.expiryRisks?.filter(r => r.riskLevel === 'medium').length || 0 },
    { name: 'Low Risk', value: insights?.expiryRisks?.filter(r => r.riskLevel === 'low').length || 0 },
  ].filter(d => d.value > 0);

  const reorderData = insights?.reorderOptimization?.slice(0, 6).map(r => ({
    name: r.medicineName.split(' ')[0],
    quantity: r.optimalReorderQty,
    cost: r.estimatedCost / 1000,
  })) || [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            AI Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Intelligent insights powered by machine learning
          </p>
        </div>
        <Button onClick={() => analyze('all')} disabled={isLoading} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <StatCard
              title="AI Predictions"
              value={insights?.demandForecast?.length || 0}
              icon={TrendingUp}
              variant="medical"
              subtitle="Demand forecasts"
            />
            <StatCard
              title="Expiry Alerts"
              value={insights?.expiryRisks?.filter(r => r.riskLevel === 'high').length || 0}
              icon={AlertTriangle}
              variant="warning"
              subtitle="High risk items"
            />
            <StatCard
              title="Anomalies"
              value={insights?.anomalies?.length || 0}
              icon={Activity}
              variant={insights?.anomalies?.some(a => a.severity === 'critical') ? 'critical' : 'default'}
              subtitle="Detected issues"
            />
            <StatCard
              title="Reorder Items"
              value={insights?.reorderOptimization?.filter(r => r.priority === 'urgent').length || 0}
              icon={Pill}
              variant="success"
              subtitle="Urgent priority"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pharmacy" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="pharmacy" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Pharmacy
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="beds" className="flex items-center gap-2">
            <BedDouble className="w-4 h-4" />
            Beds
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Pharmacy Tab */}
        <TabsContent value="pharmacy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Medicine Demand Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : demandChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={demandChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="stock" fill="hsl(var(--primary))" name="Current Stock" />
                      <Bar dataKey="demand" fill="hsl(var(--warning))" name="7-Day Demand" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No forecast data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expiry Risk Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Expiry Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : expiryPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPie>
                      <Pie
                        data={expiryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {expiryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No expiry data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Insights */}
          <AIInsightsPanel />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Bill Estimation Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : insights?.billEstimates && insights.billEstimates.length > 0 ? (
                  <div className="space-y-4">
                    {insights.billEstimates.map((estimate, i) => (
                      <div key={i} className="p-4 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{estimate.patientType}</span>
                          <Badge variant="outline">₹{estimate.averageBill.toLocaleString()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Expected range: {estimate.expectedRange}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {estimate.factors.map((factor, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Receipt className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>Run analysis to see billing insights</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-success" />
                  Payment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : insights?.paymentTrends ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-success">
                          ₹{insights.paymentTrends.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm text-muted-foreground">Pending Amount</p>
                        <p className="text-2xl font-bold text-warning">
                          ₹{insights.paymentTrends.pendingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-2">Top Payment Modes</p>
                      <div className="flex gap-2">
                        {insights.paymentTrends.topPaymentModes.map((mode, i) => (
                          <Badge key={i} variant="secondary">{mode}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No payment trends available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Beds Tab */}
        <TabsContent value="beds" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-primary" />
                  Occupancy Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : insights?.occupancyForecast ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-primary/10">
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-3xl font-bold">{insights.occupancyForecast.current}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-warning/10">
                        <p className="text-sm text-muted-foreground">24h Forecast</p>
                        <p className="text-3xl font-bold">{insights.occupancyForecast.predicted24h}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">48h Forecast</p>
                        <p className="text-3xl font-bold">{insights.occupancyForecast.predicted48h}%</p>
                      </div>
                    </div>
                    {insights.occupancyForecast.criticalWards.length > 0 && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-2">Critical Wards</p>
                        <div className="flex gap-2">
                          {insights.occupancyForecast.criticalWards.map((ward, i) => (
                            <Badge key={i} variant="destructive">{ward}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BedDouble className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No bed forecast available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-success" />
                  Admission Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : insights?.admissionCapacity ? (
                  <div className="space-y-3">
                    {Object.entries(insights.admissionCapacity).map(([ward, capacity]) => (
                      <div key={ward} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="font-medium capitalize">{ward.replace('_', ' ')}</span>
                        <Badge variant={Number(capacity) > 5 ? 'default' : Number(capacity) > 0 ? 'secondary' : 'destructive'}>
                          {capacity} beds available
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No capacity data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Snapshot */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Data Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : snapshot ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <Pill className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{snapshot.totalMedicines}</p>
                      <p className="text-sm text-muted-foreground">Total Medicines</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
                      <p className="text-2xl font-bold">{snapshot.lowStockCount}</p>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                      <p className="text-2xl font-bold">{snapshot.expiringCount}</p>
                      <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    </div>
                    <div className="p-4 rounded-lg bg-success/10 text-center">
                      <BedDouble className="w-8 h-8 mx-auto mb-2 text-success" />
                      <p className="text-2xl font-bold">{snapshot.totalBeds}</p>
                      <p className="text-sm text-muted-foreground">Total Beds</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <BedDouble className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{snapshot.occupiedBeds}</p>
                      <p className="text-sm text-muted-foreground">Occupied Beds</p>
                    </div>
                    <div className="p-4 rounded-lg bg-warning/10 text-center">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-warning" />
                      <p className="text-2xl font-bold">{snapshot.pendingBills}</p>
                      <p className="text-sm text-muted-foreground">Pending Bills</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Run analysis to see data snapshot
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Info */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {result?.generatedAt
                      ? new Date(result.generatedAt).toLocaleString()
                      : 'Not analyzed yet'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1">Analysis Type</p>
                  <Badge>{result?.analysisType || 'N/A'}</Badge>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Demand Forecast</Badge>
                    <Badge variant="outline" className="text-xs">Expiry Risk</Badge>
                    <Badge variant="outline" className="text-xs">Anomaly Detection</Badge>
                    <Badge variant="outline" className="text-xs">Reorder Optimization</Badge>
                    <Badge variant="outline" className="text-xs">Bill Estimation</Badge>
                    <Badge variant="outline" className="text-xs">Bed Forecast</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reorder Optimization Chart */}
          {reorderData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Reorder Optimization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reorderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="quantity" fill="hsl(var(--primary))" name="Quantity" />
                    <Bar yAxisId="right" dataKey="cost" fill="hsl(var(--warning))" name="Cost (₹K)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};