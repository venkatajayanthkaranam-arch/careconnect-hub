import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorder_level: number;
  price: number;
  store: string;
  expiry_date: string | null;
}

interface PrescriptionItem {
  medicine_name: string;
  quantity: number;
  issued_at: string | null;
  is_issued: boolean;
}

interface Bill {
  patient_id: string;
  total_amount: number;
  type: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisType } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch data based on analysis type
    let medicines: Medicine[] = [];
    let prescriptionItems: PrescriptionItem[] = [];
    let bills: Bill[] = [];
    let beds: any[] = [];
    let admissions: any[] = [];

    if (analysisType === "pharmacy" || analysisType === "all") {
      const [medicinesRes, itemsRes] = await Promise.all([
        supabase.from("medicines").select("*"),
        supabase.from("prescription_items").select("medicine_name, quantity, issued_at, is_issued"),
      ]);
      medicines = medicinesRes.data || [];
      prescriptionItems = itemsRes.data || [];
    }

    if (analysisType === "billing" || analysisType === "all") {
      const billsRes = await supabase.from("bills").select("patient_id, total_amount, type, created_at");
      bills = billsRes.data || [];
    }

    if (analysisType === "beds" || analysisType === "all") {
      const [bedsRes, admissionsRes] = await Promise.all([
        supabase.from("beds").select("*"),
        supabase.from("admissions").select("*").eq("status", "admitted"),
      ]);
      beds = bedsRes.data || [];
      admissions = admissionsRes.data || [];
    }

    // Build comprehensive prompt for AI analysis
    const systemPrompt = `You are an AI analytics engine for a hospital management system. Analyze the provided data and return actionable insights in JSON format.

IMPORTANT: Return ONLY valid JSON without markdown formatting or code blocks.

For pharmacy analysis, provide:
1. demandForecast: Array of {medicineName, currentStock, predictedDemand7Days, reorderRecommendation, confidence}
2. expiryRisks: Array of {medicineName, expiryDate, daysUntilExpiry, riskLevel: "low"|"medium"|"high", recommendedAction}
3. anomalies: Array of {type, description, severity: "info"|"warning"|"critical", affectedItems}
4. substitutions: Array of {unavailableMedicine, alternatives: [{name, similarity, inStock}]}
5. loadPrediction: {peakHours: string[], expectedLoad: "low"|"medium"|"high", staffingRecommendation}
6. reorderOptimization: Array of {medicineName, optimalReorderQty, estimatedCost, priority: "urgent"|"normal"|"low"}

For billing analysis, provide:
1. billEstimates: Array of {patientType, averageBill, expectedRange, factors}
2. paymentTrends: {totalRevenue, pendingAmount, averagePaymentTime, topPaymentModes}
3. anomalies: Array of billing irregularities

For bed management, provide:
1. occupancyForecast: {current, predicted24h, predicted48h, criticalWards}
2. dischargeRecommendations: Array of patients likely ready for discharge
3. admissionCapacity: Available capacity by ward type

Be specific with numbers and percentages. Base predictions on actual data patterns.`;

    const dataContext = JSON.stringify({
      medicines: medicines.map(m => ({
        name: m.name,
        category: m.category,
        stock: m.stock,
        reorderLevel: m.reorder_level,
        price: m.price,
        store: m.store,
        expiryDate: m.expiry_date,
        daysUntilExpiry: m.expiry_date 
          ? Math.ceil((new Date(m.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        isLowStock: m.stock <= m.reorder_level,
      })),
      prescriptionHistory: prescriptionItems.map(p => ({
        medicineName: p.medicine_name,
        quantity: p.quantity,
        issuedAt: p.issued_at,
        wasIssued: p.is_issued,
      })),
      billingData: bills.map(b => ({
        patientId: b.patient_id,
        amount: b.total_amount,
        type: b.type,
        date: b.created_at,
      })),
      bedData: {
        total: beds.length,
        occupied: beds.filter(b => b.status === "occupied").length,
        available: beds.filter(b => b.status === "available").length,
        byWard: beds.reduce((acc: any, b) => {
          acc[b.ward_type] = acc[b.ward_type] || { total: 0, occupied: 0 };
          acc[b.ward_type].total++;
          if (b.status === "occupied") acc[b.ward_type].occupied++;
          return acc;
        }, {}),
      },
      activeAdmissions: admissions.length,
      currentDate: new Date().toISOString(),
    });

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this hospital data and provide insights:\n\n${dataContext}` },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "{}";
    
    // Parse AI response - handle potential markdown formatting
    let insights;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      insights = JSON.parse(cleanContent.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      insights = { error: "Failed to parse AI insights", raw: content };
    }

    return new Response(JSON.stringify({
      success: true,
      analysisType,
      insights,
      dataSnapshot: {
        totalMedicines: medicines.length,
        lowStockCount: medicines.filter(m => m.stock <= m.reorder_level).length,
        expiringCount: medicines.filter(m => {
          if (!m.expiry_date) return false;
          const days = Math.ceil((new Date(m.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return days <= 90;
        }).length,
        totalBeds: beds.length,
        occupiedBeds: beds.filter(b => b.status === "occupied").length,
        pendingBills: bills.filter(b => b.total_amount > 0).length,
      },
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Pharmacy AI error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});