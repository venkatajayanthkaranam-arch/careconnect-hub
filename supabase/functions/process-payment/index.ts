import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ProcessPaymentRequest {
  bill_id: string
  amount: number
  payment_mode: 'cash' | 'card' | 'upi' | 'insurance' | 'online'
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

    // Verify user
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
    const body: ProcessPaymentRequest = await req.json()

    // Validate
    if (!body.bill_id || !body.amount || !body.payment_mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bill_id, amount, payment_mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Payment amount must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the bill
    const { data: bill, error: billError } = await supabaseAdmin
      .from('bills')
      .select('*')
      .eq('id', body.bill_id)
      .single()

    if (billError || !bill) {
      return new Response(
        JSON.stringify({ error: 'Bill not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (bill.status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Bill is already fully paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (bill.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Cannot pay a cancelled bill' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const remainingAmount = bill.total_amount - bill.paid_amount
    const paymentAmount = Math.min(body.amount, remainingAmount)
    const newPaidAmount = bill.paid_amount + paymentAmount
    const newStatus = newPaidAmount >= bill.total_amount ? 'paid' : 'partial'

    // Update bill
    const { data: updatedBill, error: updateError } = await supabaseAdmin
      .from('bills')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        payment_mode: body.payment_mode,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', body.bill_id)
      .select()
      .single()

    if (updateError) {
      console.error('Payment update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to process payment', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update appointment payment status if linked
    if (bill.appointment_id) {
      await supabaseAdmin
        .from('appointments')
        .update({ payment_status: newStatus === 'paid' ? 'paid' : 'partial' })
        .eq('id', bill.appointment_id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          bill_id: updatedBill.id,
          amount_paid: paymentAmount,
          total_paid: updatedBill.paid_amount,
          total_amount: updatedBill.total_amount,
          remaining: updatedBill.total_amount - updatedBill.paid_amount,
          status: updatedBill.status,
          payment_mode: body.payment_mode,
        },
        message: newStatus === 'paid'
          ? 'Payment completed successfully. Bill is fully paid.'
          : `Partial payment of ₹${paymentAmount} recorded. ₹${updatedBill.total_amount - updatedBill.paid_amount} remaining.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Payment processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
