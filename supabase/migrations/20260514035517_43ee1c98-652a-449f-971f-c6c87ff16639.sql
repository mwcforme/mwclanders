CREATE OR REPLACE FUNCTION public.is_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT lower(_email) = ANY (ARRAY[
    'eobrien@mwcforme.com',
    'hammad@mwcforme.com'
  ]::text[]);
$function$;