-- Create function to increment likes count on community posts
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$;

-- Create function to decrement likes count on community posts
CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$;