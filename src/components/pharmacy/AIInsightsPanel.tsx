import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  Package,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { usePharmacyAI, type AIAnalysisResult } from '@/hooks/usePharmacyAI';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  compact?: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ compact = false }) => {
  const { analyze, isLoading, result, error } = usePharmacyAI();

  const handleAnalyze = () => {
    analyze('pharmacy');
  };

  if (!result && !isLoading) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-sm">
            Get intelligent predictions for demand forecasting, expiry risks, and inventory optimization.
          </p>
          <Button onClick={handleAnalyze} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Run AI Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            Analyzing...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-6 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleAnalyze}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const insights = result?.insights;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Insights
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleAnalyze} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-primary">
                {insights?.demandForecast?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Forecasts</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-warning">
                {insights?.expiryRisks?.filter(r => r.riskLevel === 'high').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-destructive">
                {insights?.anomalies?.filter(a => a.severity === 'critical').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
          </div>

          {/* Top reorder recommendation */}
          {insights?.reorderOptimization && insights.reorderOptimization.length > 0 && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Urgent Reorder</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.reorderOptimization.filter(r => r.priority === 'urgent').map(r => r.medicineName).join(', ') || 'No urgent items'}
              </p>
            </div>
          )}

          {/* Load prediction */}
          {insights?.loadPrediction && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Load Prediction</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Peak hours: {insights.loadPrediction.peakHours.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Analytics</h2>
          <Badge variant="outline" className="text-xs">
            Updated {new Date(result?.generatedAt || '').toLocaleTimeString()}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Demand Forecast */}
      {insights?.demandForecast && insights.demandForecast.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Demand Forecast (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.demandForecast.slice(0, 5).map((forecast, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{forecast.medicineName}</span>
                      <span className="text-xs text-muted-foreground">
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                    <Progress 
                      value={(forecast.predictedDemand7Days / forecast.currentStock) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Stock: {forecast.currentStock}</span>
                      <span>Predicted: {forecast.predictedDemand7Days}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiry Risks */}
      {insights?.expiryRisks && insights.expiryRisks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Expiry Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.expiryRisks.map((risk, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 rounded-lg border",
                    risk.riskLevel === 'high' && "bg-destructive/10 border-destructive/20",
                    risk.riskLevel === 'medium' && "bg-warning/10 border-warning/20",
                    risk.riskLevel === 'low' && "bg-muted/50 border-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{risk.medicineName}</span>
                    <Badge 
                      variant={risk.riskLevel === 'high' ? 'destructive' : risk.riskLevel === 'medium' ? 'secondary' : 'outline'}
                    >
                      {risk.daysUntilExpiry} days
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{risk.recommendedAction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies */}
      {insights?.anomalies && insights.anomalies.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.anomalies.map((anomaly, i) => (
                <div 
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border",
                    anomaly.severity === 'critical' && "bg-destructive/10 border-destructive/30",
                    anomaly.severity === 'warning' && "bg-warning/10 border-warning/30",
                    anomaly.severity === 'info' && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {anomaly.type}
                    </Badge>
                  </div>
                  <p className="text-sm">{anomaly.description}</p>
                  {anomaly.affectedItems.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Affected: {anomaly.affectedItems.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reorder Optimization */}
      {insights?.reorderOptimization && insights.reorderOptimization.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Reorder Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.reorderOptimization.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div>
                    <span className="font-medium text-sm">{item.medicineName}</span>
                    <div className="text-xs text-muted-foreground">
                      Qty: {item.optimalReorderQty} | Est. ₹{item.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                  <Badge 
                    variant={item.priority === 'urgent' ? 'destructive' : item.priority === 'normal' ? 'secondary' : 'outline'}
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};