-- 1. Create trigger to auto-create profile on signup (the function exists but trigger is missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Create an admin user for testing
-- First, we need to insert into auth.users which we cannot do directly
-- Instead, we'll create a function to seed admin data that can be called after signup

-- Create a function to promote a user to admin by email
CREATE OR REPLACE FUNCTION public.create_admin_role(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user_id from profiles by email
  SELECT id INTO _user_id FROM public.profiles WHERE email = admin_email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role, employee_id, is_active)
  VALUES (_user_id, 'admin', 'HMS-ADMIN-001', true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- 3. Allow patients to insert their own record during registration
-- Update RLS policy to allow new users to create their patient record
CREATE POLICY "Users can create own patient record"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());