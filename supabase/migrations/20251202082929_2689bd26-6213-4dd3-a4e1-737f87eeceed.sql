-- Update RLS policies to require admin role for direct posting

-- Drop existing policies on projects table
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

-- Create new policy: Only admins can create projects directly
CREATE POLICY "Only admins can create projects directly" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Drop existing policies on problem_statements table
DROP POLICY IF EXISTS "Authenticated users can create problem statements" ON public.problem_statements;

-- Create new policy: Only admins can create problem statements directly
CREATE POLICY "Only admins can create problem statements directly" 
ON public.problem_statements 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure regular users can submit to pending_submissions
-- (This policy should already exist but let's make sure)
DROP POLICY IF EXISTS "Users can create submissions" ON public.pending_submissions;

CREATE POLICY "Users can submit for approval" 
ON public.pending_submissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = submitted_by);