import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user is an admin
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user: requestingUser }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user is an admin
    const { data: adminRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userId, deleteType } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!deleteType || !["temporary", "permanent"].includes(deleteType)) {
      return new Response(
        JSON.stringify({ error: "Delete type must be 'temporary' or 'permanent'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (userId === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (deleteType === "temporary") {
      // Soft delete - mark as inactive
      const { error: updateError } = await supabaseAdmin
        .from("user_roles")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User temporarily deactivated. They can be reactivated later." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (deleteType === "permanent") {
      // Get user details before deletion for logging
      const { data: userDetails } = await supabaseAdmin
        .from("profiles")
        .select("email, name")
        .eq("id", userId)
        .maybeSingle();

      // Delete from user_roles first (RLS protected table)
      const { error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) {
        console.error("Error deleting user_roles:", rolesError);
      }

      // Delete from doctors table if exists
      const { error: doctorsError } = await supabaseAdmin
        .from("doctors")
        .delete()
        .eq("user_id", userId);

      if (doctorsError) {
        console.error("Error deleting doctors:", doctorsError);
      }

      // Delete profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
      }

      // Finally, delete from auth.users (this requires service role)
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to delete user from authentication system",
            details: authDeleteError.message 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Permanently deleted user: ${userDetails?.email || userId}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User permanently deleted from the system." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: unknown) {
    console.error("Error in delete-user function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Invalid request" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
