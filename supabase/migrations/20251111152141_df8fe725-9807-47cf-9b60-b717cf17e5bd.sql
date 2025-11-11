-- Add foreign key constraint for pending_submissions to profiles
ALTER TABLE public.pending_submissions
ADD CONSTRAINT pending_submissions_submitted_by_fkey 
FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key for reviewed_by as well
ALTER TABLE public.pending_submissions
ADD CONSTRAINT pending_submissions_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;