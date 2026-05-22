-- Fix booking_event_log event_type constraint.
-- Original constraint only covered 'attempt','success','error' but the
-- application inserts 'confirm_attempt','confirm_success','confirm_failed',
-- 'lead_capture','sync_validation'. Expand to the full set.

ALTER TABLE public.booking_event_log
  DROP CONSTRAINT IF EXISTS booking_event_log_event_type_check;

ALTER TABLE public.booking_event_log
  ADD CONSTRAINT booking_event_log_event_type_check
  CHECK (event_type IN (
    'attempt',
    'success',
    'error',
    'confirm_attempt',
    'confirm_success',
    'confirm_failed',
    'lead_capture',
    'sync_validation'
  ));

COMMENT ON COLUMN public.booking_event_log.event_type IS
  'Booking and lead event types. Expand this constraint when adding new event types.';
