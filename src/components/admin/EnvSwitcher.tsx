import { useState, useEffect } from "react";
import { APP_ENV } from "@/lib/env";
import { setEnvOverride } from "@/lib/envOverride";
import { supabase } from "@/integrations/supabase/legacy";

const CONFIRM_KEY = "mwc_env_switch_confirmed";

/**
 * Admin-only environment selector.
 * Toggle between Stage / Prod with a submit button.
 * After switching to Stage, a confirmation message with timestamp is shown.
 */
export function EnvSwitcher() {
  const [stageEnabled, setStageEnabled] = useState(APP_ENV === "stage");
  const [confirmation, setConfirmation] = useState<{ message: string; time: string } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONFIRM_KEY);
      if (raw) {
        const { env, time } = JSON.parse(raw);
        if (env === "stage") {
          setConfirmation({ message: "Stage mode activated", time });
        }
        window.localStorage.removeItem(CONFIRM_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async () => {
    const target = stageEnabled ? "stage" : "prod";
    if (target === APP_ENV) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("env_change_log").insert({
        user_id: session?.user.id ?? null,
        user_email: session?.user.email ?? null,
        from_env: APP_ENV,
        to_env: target,
      });
    } catch {
      /* non-blocking */
    }
    try {
      window.localStorage.setItem(
        CONFIRM_KEY,
        JSON.stringify({ env: target, time: new Date().toLocaleString() })
      );
    } catch {
      /* ignore */
    }
    setEnvOverride(target);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          Stage mode
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={stageEnabled}
          onClick={() => setStageEnabled((v) => !v)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-cta)] ${
            stageEnabled ? "bg-emerald-500" : "bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              stageEnabled ? "translate-x-[18px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={stageEnabled === (APP_ENV === "stage")}
        className="rounded-md bg-[var(--brand-cta)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--brand-cta)]/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Apply
      </button>

      {confirmation && (
        <div className="text-right">
          <div className="text-xs font-medium text-emerald-400">{confirmation.message}</div>
          <div className="text-[10px] text-white/50">{confirmation.time}</div>
        </div>
      )}
    </div>
  );
}
