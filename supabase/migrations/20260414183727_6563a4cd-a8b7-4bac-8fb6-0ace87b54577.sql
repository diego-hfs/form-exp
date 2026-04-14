
-- Drop existing select policy
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;

-- Create new policy allowing public read (needed for login lookup by name)
CREATE POLICY "Anyone can read profiles for login"
ON public.profiles
FOR SELECT
USING (true);
