import { LegalPage, H2 } from "./LegalPage";

export default function TcpaDisclosure() {
  return (
    <LegalPage title="TCPA Consent Disclosure" updated="May 13, 2026">
      <p>
        When you check the consent box on a Men's Wellness Centers contact form and submit your phone number, you provide express written consent under the Telephone Consumer Protection Act (TCPA) to be contacted by Men's Wellness Centers and its agents at the number provided.
      </p>

      <H2>Scope of consent</H2>
      <p>
        Consent includes calls and SMS messages, which may be placed using automatic telephone dialing systems or prerecorded voices, regarding your inquiry, appointment scheduling, reminders, and related services. Message and data rates may apply. Message frequency varies.
      </p>

      <H2>Consent is not a condition of purchase</H2>
      <p>
        You are not required to provide consent as a condition of receiving any goods or services. You may instead call the center directly to schedule an appointment.
      </p>

      <H2>Opting out</H2>
      <p>
        Reply STOP to any text to opt out of SMS messages. Reply HELP for assistance. To opt out of phone calls, ask the agent to remove your number from our list, or email privacy@menswellnesscenters.com.
      </p>

      <H2>Records</H2>
      <p>
        We retain a record of your consent, including the date, the form you submitted, the IP address, and the marketing source, for the period required by law.
      </p>
    </LegalPage>
  );
}
