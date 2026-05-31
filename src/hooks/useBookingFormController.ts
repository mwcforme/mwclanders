/**
 * useBookingFormController — shared hook for LP lead-capture forms.
 *
 * OCP: TRTHeroForm, CROHeroForm, FormEmbed, DateFirstLander, ShortQuiz
 *      all share the same submit → GHL → enterBookingFunnel pattern.
 *      This hook encapsulates it so forms can extend behaviour without
 *      duplicating controller wiring.
 *
 * SRP: UI components own layout/style; this hook owns submit logic.
 */
import { useNavigate } from "react-router-dom";
import { useLeadSubmitController } from "@/domain/leads/useLeadSubmitController";
import { heroLeadSchema, type HeroLeadInput, type LocationKey } from "@/domain/leads/leadFormSchema";
import { enterBookingFunnel } from "@/domain/booking/bookingEntry";
import { capturePartialLead, markSessionSubmitted } from "@/lib/partialCapture";
import { trackFunnelEvent } from "@/hooks/useAnalytics";

export type BookingService = "trt" | "wl" | "ed";

interface UseBookingFormControllerOptions {
  source: string;
  service?: BookingService;
  /** Called immediately when phone blurs with >= 7 digits (partial capture). */
  onPartialCapture?: (phone: string, name?: string) => void;
}

export function useBookingFormController({
  source,
  service = "trt",
  onPartialCapture,
}: UseBookingFormControllerOptions) {
  const navigate = useNavigate();

  const controller = useLeadSubmitController<HeroLeadInput>({
    schema: heroLeadSchema,
    source,
    toLeadInput: (v) => {
      const [first, ...rest] = v.name.trim().split(/\s+/);
      return {
        firstName: first || "Guest",
        lastName:  rest.join(" ") || undefined,
        email:     undefined,
        phone:     v.phone,
      };
    },
    onSuccess: (result, v) => {
      markSessionSubmitted();
      trackFunnelEvent("booking_started", { service, location: v.location });
      const [first, ...rest] = v.name.trim().split(/\s+/);
      enterBookingFunnel(
        {
          identity: {
            firstName:    first || "Guest",
            lastName:     rest.join(" ") || undefined,
            email:        "",
            phone:        v.phone,
            ghlContactId: result.contactId,
          },
          service,
          location: v.location,
          source,
          lpSlug: typeof window !== "undefined" ? window.location.pathname : undefined,
        },
        navigate,
      );
    },
    toastOnError: false,
  });

  function handlePhoneBlur(phone: string, name?: string) {
    if (phone.replace(/\D/g, "").length >= 7) {
      void capturePartialLead({ phone, name, source });
      onPartialCapture?.(phone, name);
    }
  }

  return { controller, handlePhoneBlur };
}
