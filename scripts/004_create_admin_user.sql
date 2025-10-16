-- Create admin user with specific credentials
-- Password: Saviogogo13 (hashed with bcrypt)
-- Note: This is a placeholder. In production, use Supabase Auth to create the user properly.

-- First, ensure the admin email is set in system config
INSERT INTO public.system_config (key, value, description) 
VALUES ('admin_email', '"saviobof@gmail.com"', 'Admin email for free testing')
ON CONFLICT (key) DO UPDATE SET value = '"saviobof@gmail.com"';

-- Note: To create the actual admin user, you need to:
-- 1. Sign up through the Supabase Auth UI with email: saviobof@gmail.com
-- 2. Then run this SQL to update the user role:
-- UPDATE public.users SET role = 'admin' WHERE email = 'saviobof@gmail.com';

-- Or use Supabase Auth Admin API to create the user programmatically
