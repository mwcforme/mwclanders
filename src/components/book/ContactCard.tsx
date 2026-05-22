import { Phone, MessageSquareText } from "lucide-react";

interface Props {
  type: "call" | "text";
  phoneDisplay: string;
  phoneTel: string;
  smsHref: string;
  onCallClick: () => void;
  onSmsClick: () => void;
}

export function ContactCard({ type, phoneDisplay, phoneTel, smsHref, onCallClick, onSmsClick }: Props) {
  const isCall = type === "call";

  return (
    <section
      style={{
        background: "var(--c-text-on-dark)",
        borderRadius: 14,
        padding: "20px",
        // hardcoded-color-allow-next-line
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          aria-hidden="true"
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, borderRadius: 10, background: isCall ? "var(--brand-cta)" : "#FFF5EE" }}
        >
          {isCall
            ? <Phone size={20} strokeWidth={2.25} style={{ color: "var(--c-text-on-dark)" }} />
            : <MessageSquareText size={20} strokeWidth={2.25} style={{ color: "var(--brand-cta)" }} />
          }
        </span>
        <div>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--brand-navy-deep)", lineHeight: 1.2 }}>
            {isCall ? "Call us" : "Prefer to text?"}
          </h2>
          <p style={{ color: "#5A6478", fontSize: 14, fontWeight: 500, lineHeight: 1.35, marginTop: 2 }}>
            {isCall ? "Mon–Fri 8am–6pm · Sat 8am–4pm. A real person picks up." : "Same number. We reply same day."}
          </p>
        </div>
      </div>

      <a
        href={isCall ? phoneTel : smsHref}
        onClick={isCall ? onCallClick : onSmsClick}
        className="flex items-center justify-center gap-2 transition-transform hover:-translate-y-[1px]"
        style={{
          width: "100%", minHeight: 60,
          background: isCall ? "var(--brand-cta)" : "var(--c-text-on-dark)",
          color: isCall ? "var(--c-text-on-dark)" : "var(--brand-navy-deep)",
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 20,
          borderRadius: 10, textDecoration: "none", padding: "14px 20px",
          // hardcoded-color-allow-next-line
          boxShadow: isCall ? "0 6px 16px rgba(232,103,10,0.35)" : "none",
          // hardcoded-color-allow-next-line
          border: isCall ? "none" : "2px solid #0B1029",
          marginTop: "auto",
        }}
      >
        {isCall ? <Phone size={20} strokeWidth={2.5} /> : <MessageSquareText size={20} strokeWidth={2.5} />}
        <span>{phoneDisplay}</span>
      </a>

      {!isCall && (
        <p style={{ color: "var(--c-text-on-light-muted)", fontSize: 12, marginTop: 10, textAlign: "center" }}>
          Replies from (866) 344-4955. Standard messaging rates apply.
        </p>
      )}
    </section>
  );
}
