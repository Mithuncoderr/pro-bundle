-- Create function to increment upvotes count on problem statements
CREATE OR REPLACE FUNCTION public.increment_upvotes_count(problem_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.problem_statements
  SET upvotes_count = upvotes_count + 1
  WHERE id = problem_id;
END;
$$;

-- Create function to decrement upvotes count on problem statements
CREATE OR REPLACE FUNCTION public.decrement_upvotes_count(problem_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.problem_statements
  SET upvotes_count = GREATEST(upvotes_count - 1, 0)
  WHERE id = problem_id;
END;
$$;