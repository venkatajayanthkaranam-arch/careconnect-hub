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
  payment_mode?: 'cash' | 'card' | 'upi' | 'insurance' | 'online'
  pay_now?: boolean
}

function classifyRisk(symptoms: string[] = [], severity?: string): 'low' | 'medium' | 'high' {
  const highRiskSymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness', 'high fever', 'bleeding', 'shortness of breath', 'fainting'];
  const mediumRiskSymptoms = ['persistent pain', 'dizziness', 'nausea', 'moderate fever', 'swelling', 'persistent cough', 'abdominal pain'];
  
  const symptomsLower = symptoms.map(s => s.toLowerCase());
  
  if (highRiskSymptoms.some(hs => symptomsLower.some(s => s.includes(hs)))) return 'high';
  if (severity === 'severe' || severity === 'critical' || severity === 'high') return 'high';
  if (mediumRiskSymptoms.some(ms => symptomsLower.some(s => s.includes(ms)))) return 'medium';
  if (severity === 'moderate' || severity === 'medium') return 'medium';
  return 'low';
}

Deno.serve(async (req) => {
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

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token)
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const body: BookAppointmentRequest = await req.json()

    // Validate required fields
    if (!body.patient_id || !body.department || !body.appointment_date || !body.appointment_time) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: patient_id, department, appointment_date, appointment_time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Classify risk
    const riskLevel = classifyRisk(body.symptoms, body.symptom_severity)

    // Get consultation fee
    let consultationFee = 500
    let doctorName = ''
    if (body.doctor_id) {
      const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('consultation_fee, name')
        .eq('id', body.doctor_id)
        .maybeSingle()
      
      if (doctor) {
        if (doctor.consultation_fee) consultationFee = doctor.consultation_fee
        doctorName = doctor.name || ''
      }
    }

    // Get patient info for confirmation
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('name, email, phone')
      .eq('id', body.patient_id)
      .maybeSingle()

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

    // Create bill
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
    }

    // Create bill item
    if (bill) {
      await supabaseAdmin
        .from('bill_items')
        .insert({
          bill_id: bill.id,
          service_name: 'Consultation Fee',
          category: 'consultation',
          quantity: 1,
          unit_price: consultationFee,
          total: consultationFee,
        })

      // Handle payment if pay_now is true
      if (body.pay_now && body.payment_mode) {
        const { error: payError } = await supabaseAdmin
          .from('bills')
          .update({
            paid_amount: consultationFee,
            status: 'paid',
            payment_mode: body.payment_mode,
            paid_at: new Date().toISOString(),
          })
          .eq('id', bill.id)

        if (!payError) {
          await supabaseAdmin
            .from('appointments')
            .update({ payment_status: 'paid' })
            .eq('id', appointment.id)
        }
      }
    }

    // Create alert for high-risk
    if (riskLevel === 'high') {
      await supabaseAdmin
        .from('alerts')
        .insert({
          type: 'emergency',
          severity: 'warning',
          message: `High-risk appointment booked for ${patient?.name || body.patient_id}. Symptoms: ${body.symptoms?.join(', ') || 'Not specified'}`,
        })
    }

    // Build confirmation details
    const confirmation = {
      appointment_id: appointment.id,
      patient_name: patient?.name || 'N/A',
      patient_email: patient?.email || null,
      doctor_name: doctorName ? `Dr. ${doctorName}` : 'To be assigned',
      department: body.department,
      date: body.appointment_date,
      time: body.appointment_time,
      risk_level: riskLevel,
      consultation_fee: consultationFee,
      payment_status: body.pay_now && body.payment_mode ? 'paid' : 'pending',
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
          total_amount: consultationFee,
          status: body.pay_now && body.payment_mode ? 'paid' : 'pending',
          payment_mode: body.payment_mode || null,
        } : null,
        confirmation,
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
