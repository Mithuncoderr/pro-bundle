-- Create pending_submissions table for user-submitted ideas awaiting approval
CREATE TABLE public.pending_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL,
  submitted_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.pending_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.pending_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can create submissions
CREATE POLICY "Users can create submissions"
ON public.pending_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Only admins can update submissions (for approval/rejection)
CREATE POLICY "Admins can update submissions"
ON public.pending_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.pending_submissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_pending_submissions_updated_at
BEFORE UPDATE ON public.pending_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();