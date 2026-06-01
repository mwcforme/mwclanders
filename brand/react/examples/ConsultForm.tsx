/**
 * Men's Wellness Centers — Example: above-the-fold visit funnel form (v1.3.0)
 *
 * Demonstrates the locked rules in one composition:
 *  - Mobile-first (max-w-md), CTA visible without scroll
 *  - Primary button = deep #CA4A0E + white text + glow
 *  - 4-field max (first, last, phone, ZIP), phone prioritized
 *  - Express SMS opt-in checkbox (unchecked by default), deep-orange check
 *  - 60-minute in-person framing, "no-cost visit/appointment", members not patients
 *  - No em-dashes, no "free", no "guy/guys", no "clinic"
 *
 * Drop on a navy hero: <section className="bg-surface-dark"> ... </section>
 */
import * as React from "react";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Checkbox } from "../components/Checkbox";
import { Button } from "../components/Button";

export function ConsultForm() {
  const [smsOk, setSmsOk] = React.useState(false);

  return (
    <Card tone="light" className="mx-auto w-full max-w-md">
      <h2 className="font-display uppercase tracking-wide text-[28px] leading-tight text-on-light">
        Find Your Edge Over Age
      </h2>
      <p className="mt-2 font-marketing text-[15px] text-on-light-muted">
        Book your no-cost, 60-minute in-person visit with a physician at your
        local Men&apos;s Wellness Centers.
      </p>

      <form className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input name="first" label="First name" required autoComplete="given-name" />
          <Input name="last" label="Last name" required autoComplete="family-name" />
        </div>
        <Input
          name="phone"
          type="tel"
          label="Phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="(555) 555-5555"
        />
        <Input
          name="zip"
          label="ZIP code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000"
        />

        <Checkbox
          name="smsConsent"
          checked={smsOk}
          onChange={(e) => setSmsOk(e.target.checked)}
          label={
            <>
              By submitting, you agree to receive SMS from Men&apos;s Wellness
              Centers. Msg &amp; data rates may apply. Reply STOP to opt out.
            </>
          }
        />

        <Button type="submit" variant="primary" size="lg" fullWidth>
          Reserve My 60-Minute Visit
        </Button>

        <p className="font-ui text-[12px] text-on-light-muted">
          Treatment requires a clinical evaluation and is provided only when
          medically appropriate. Men&apos;s Wellness Centers is LegitScript
          certified.
        </p>
      </form>
    </Card>
  );
}

export default ConsultForm;
