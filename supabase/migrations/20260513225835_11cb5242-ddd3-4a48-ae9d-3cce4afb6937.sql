CREATE POLICY "service role can update lead captures"
ON public.lead_captures
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
