import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface BookAppointmentRequest {
  patient_id: string
  doctor_id?: string
  department: string
  appointment_date: string
  appointment_time: string
  type: 'op' | 'follow_up' | 'emergency'
  symptoms?: string[]
  symptom_duration?: string
  symptom_severity?: string
  additional_notes?: string
  booking_type: 'user' | 'reception'
}

// Simple risk classification based on symptoms
function classifyRisk(symptoms: string[] = [], severity?: string): 'low' | 'medium' | 'high' {
  const highRiskSymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness', 'high fever', 'bleeding'];
  const mediumRiskSymptoms = ['persistent pain', 'dizziness', 'nausea', 'moderate fever', 'swelling'];
  
  const symptomsLower = symptoms.map(s => s.toLowerCase());
  
  // Check for high risk symptoms
  if (highRiskSymptoms.some(hs => symptomsLower.some(s => s.includes(hs)))) {
    return 'high';
  }
  
  // Check severity
  if (severity === 'severe' || severity === 'critical') {
    return 'high';
  }
  
  // Check for medium risk symptoms
  if (mediumRiskSymptoms.some(ms => symptomsLower.some(s => s.includes(ms)))) {
    return 'medium';
  }
  
  if (severity === 'moderate') {
    return 'medium';
  }
  
  return 'low';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Create client with user's auth for RLS
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token)
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const body: BookAppointmentRequest = await req.json()

    // Validate required fields
    if (!body.patient_id || !body.department || !body.appointment_date || !body.appointment_time) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: patient_id, department, appointment_date, appointment_time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Classify risk level based on symptoms
    const riskLevel = classifyRisk(body.symptoms, body.symptom_severity)

    // Get consultation fee if doctor is specified
    let consultationFee = 500 // Default fee
    if (body.doctor_id) {
      const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('consultation_fee')
        .eq('id', body.doctor_id)
        .maybeSingle()
      
      if (doctor?.consultation_fee) {
        consultationFee = doctor.consultation_fee
      }
    }

    // Create the appointment
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id: body.patient_id,
        doctor_id: body.doctor_id || null,
        department: body.department,
        appointment_date: body.appointment_date,
        appointment_time: body.appointment_time,
        type: body.type || 'op',
        symptoms: body.symptoms || [],
        symptom_duration: body.symptom_duration,
        symptom_severity: body.symptom_severity,
        additional_notes: body.additional_notes,
        booking_type: body.booking_type || 'user',
        risk_level: riskLevel,
        status: 'scheduled',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Appointment creation error:', appointmentError)
      return new Response(
        JSON.stringify({ error: 'Failed to create appointment', details: appointmentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create automatic bill for the appointment
    const { data: bill, error: billError } = await supabaseAdmin
      .from('bills')
      .insert({
        patient_id: body.patient_id,
        appointment_id: appointment.id,
        type: 'op',
        total_amount: consultationFee,
        paid_amount: 0,
        status: 'pending',
      })
      .select()
      .single()

    if (billError) {
      console.error('Bill creation error:', billError)
      // Don't fail the appointment if bill creation fails
      // Just log the error
    }

    // Create bill item for consultation fee
    if (bill) {
      const { error: billItemError } = await supabaseAdmin
        .from('bill_items')
        .insert({
          bill_id: bill.id,
          service_name: 'Consultation Fee',
          category: 'consultation',
          quantity: 1,
          unit_price: consultationFee,
          total: consultationFee,
        })

      if (billItemError) {
        console.error('Bill item creation error:', billItemError)
      }
    }

    // Create an alert for high-risk appointments
    if (riskLevel === 'high') {
      await supabaseAdmin
        .from('alerts')
        .insert({
          type: 'emergency',
          severity: 'warning',
          message: `High-risk appointment booked for patient ${body.patient_id}. Symptoms: ${body.symptoms?.join(', ') || 'Not specified'}`,
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: appointment.id,
          patient_id: appointment.patient_id,
          department: appointment.department,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          risk_level: riskLevel,
          status: appointment.status,
        },
        bill: bill ? {
          id: bill.id,
          total_amount: bill.total_amount,
          status: bill.status,
        } : null,
        message: 'Appointment booked successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
