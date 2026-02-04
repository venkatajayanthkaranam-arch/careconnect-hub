import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface DemandForecast {
  medicineName: string;
  currentStock: number;
  predictedDemand7Days: number;
  reorderRecommendation: string;
  confidence: number;
}

export interface ExpiryRisk {
  medicineName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

export interface Anomaly {
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affectedItems: string[];
}

export interface Substitution {
  unavailableMedicine: string;
  alternatives: Array<{
    name: string;
    similarity: number;
    inStock: boolean;
  }>;
}

export interface LoadPrediction {
  peakHours: string[];
  expectedLoad: 'low' | 'medium' | 'high';
  staffingRecommendation: string;
}

export interface ReorderOptimization {
  medicineName: string;
  optimalReorderQty: number;
  estimatedCost: number;
  priority: 'urgent' | 'normal' | 'low';
}

export interface PharmacyInsights {
  demandForecast?: DemandForecast[];
  expiryRisks?: ExpiryRisk[];
  anomalies?: Anomaly[];
  substitutions?: Substitution[];
  loadPrediction?: LoadPrediction;
  reorderOptimization?: ReorderOptimization[];
}

export interface BillingInsights {
  billEstimates?: Array<{
    patientType: string;
    averageBill: number;
    expectedRange: string;
    factors: string[];
  }>;
  paymentTrends?: {
    totalRevenue: number;
    pendingAmount: number;
    averagePaymentTime: string;
    topPaymentModes: string[];
  };
  anomalies?: Anomaly[];
}

export interface BedInsights {
  occupancyForecast?: {
    current: number;
    predicted24h: number;
    predicted48h: number;
    criticalWards: string[];
  };
  dischargeRecommendations?: Array<{
    patientId: string;
    reason: string;
    confidence: number;
  }>;
  admissionCapacity?: Record<string, number>;
}

export interface AIAnalysisResult {
  success: boolean;
  analysisType: string;
  insights: PharmacyInsights & BillingInsights & BedInsights;
  dataSnapshot: {
    totalMedicines: number;
    lowStockCount: number;
    expiringCount: number;
    totalBeds: number;
    occupiedBeds: number;
    pendingBills: number;
  };
  generatedAt: string;
  error?: string;
}

export function usePharmacyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (analysisType: 'pharmacy' | 'billing' | 'beds' | 'all' = 'all') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pharmacy-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ analysisType }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('AI rate limit exceeded. Please try again in a few minutes.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data: AIAnalysisResult = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success('AI analysis completed successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analyze,
    isLoading,
    result,
    error,
    clearResult: () => setResult(null),
  };
}