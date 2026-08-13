/**
 * Sponsor pitch — React Email, zero-build ESM.
 *
 * Pure createElement, no JSX, so `node` renders it directly through
 * @react-email/render — the ESM pattern react-email-esm demonstrates
 * (github.com/kodermax/react-email-esm). Editing this file and re-running
 * `npm run email` is the whole customization loop; there is no compile step
 * to forget.
 *
 * The brand is the festival's night register: near-black field, paper type,
 * one chartreuse accent, thin rules. Inline styles only, 600px container,
 * system font stack, table-based columns; the components ship the Outlook
 * fallbacks.
 *
 * Every prop is filled from the run, never written from imagination:
 *   personalNote / reasonSourceUrl <- the dossier, in the sender's own register
 *   offerSheet / highlightTier     <- the deck's own rate card, slide 7, verbatim
 *   event facts                    <- fixtures/festival-packet.json
 * A prop with no evidence behind it is omitted and its section does not render.
 * There is deliberately no attendance prop: the packet holds that figure
 * disputed, so the template gives it nowhere to go.
 */
import { createElement as h } from "react";
import {
  Body, Column, Container, Head, Hr, Html, Link,
  Preview, Row, Section, Text,
} from "@react-email/components";

const palette = {
  field: "#0a0a0f",
  card: "#101018",
  panel: "#15151e",
  line: "#26262e",
  paper: "#f4f1ea",
  muted: "#9b9ba6",
  accent: "#b7ff2e",
};

const stack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const kicker = {
  fontFamily: stack, fontSize: "11px", letterSpacing: "2px",
  textTransform: "uppercase", color: palette.muted, margin: "0",
};
const body = {
  fontFamily: stack, fontSize: "15px", lineHeight: "24px",
  color: palette.paper, margin: "0 0 14px",
};
const small = { fontFamily: stack, fontSize: "12px", lineHeight: "18px", color: palette.muted, margin: "0" };

export function SponsorPitch({
  recipientFirstName,
  companyName,
  personalNote,
  reasonSourceUrl,
  festivalName,
  festivalDates,
  festivalVenue,
  festivalMarket,
  distanceNote,
  stages = [],
  audienceLine,
  offerSheet = [],
  highlightTier,
  callUrl,
  senderName,
  senderCompany,
  optOutUrl,
  previewText,
}) {
  const offerRow = (tier, i) => {
    const hot = highlightTier && tier.tier.toLowerCase() === String(highlightTier).toLowerCase();
    return h(Section, {
      key: tier.tier,
      style: {
        borderLeft: `3px solid ${hot ? palette.accent : palette.line}`,
        backgroundColor: hot ? palette.panel : "transparent",
        padding: "10px 14px",
        marginBottom: i === offerSheet.length - 1 ? "0" : "8px",
      },
    },
      h(Row, null,
        h(Column, null,
          h(Text, { style: { ...body, margin: "0", fontWeight: 600, fontSize: "14px" } }, tier.tier),
          tier.includes?.length
            ? h(Text, { style: { ...small, marginTop: "2px" } }, tier.includes.slice(0, 2).join(" · "))
            : null,
        ),
        h(Column, { style: { width: "110px", textAlign: "right", verticalAlign: "top" } },
          h(Text, {
            style: { ...body, margin: "0", fontSize: "14px", fontWeight: 600, color: hot ? palette.accent : palette.paper },
          }, tier.range),
        ),
      ),
    );
  };

  return h(Html, null,
    h(Head, null),
    h(Preview, null, previewText),
    h(Body, { style: { backgroundColor: palette.field, margin: "0", padding: "24px 0" } },
      h(Container, { style: { backgroundColor: palette.card, maxWidth: "600px", border: `1px solid ${palette.line}` } },

        // Masthead: what this is, where, when.
        h(Section, { style: { padding: "20px 32px", borderBottom: `1px solid ${palette.line}` } },
          h(Text, { style: kicker },
            `${festivalName} · ${festivalDates} · ${festivalMarket}`),
        ),

        // The personal note opens in the recipient's world and carries the offer.
        h(Section, { style: { padding: "32px 32px 8px" } },
          h(Text, { style: body }, `${recipientFirstName},`),
          h(Text, { style: body },
            personalNote,
            reasonSourceUrl
              ? h(Link, { href: reasonSourceUrl, style: { color: palette.muted, fontSize: "12px" } }, " (source)")
              : null,
          ),
        ),

        // The event, briefly: three columns of fact.
        h(Section, { style: { padding: "8px 32px 24px" } },
          h(Section, { style: { backgroundColor: palette.panel, border: `1px solid ${palette.line}`, padding: "16px 18px" } },
            h(Row, null,
              h(Column, { style: { verticalAlign: "top" } },
                h(Text, { style: { ...kicker, marginBottom: "4px" } }, "When"),
                h(Text, { style: { ...body, margin: "0", fontSize: "13px" } }, festivalDates),
              ),
              h(Column, { style: { verticalAlign: "top" } },
                h(Text, { style: { ...kicker, marginBottom: "4px" } }, "Where"),
                h(Text, { style: { ...body, margin: "0", fontSize: "13px" } }, festivalVenue),
                distanceNote ? h(Text, { style: small }, distanceNote) : null,
              ),
              stages.length
                ? h(Column, { style: { verticalAlign: "top" } },
                    h(Text, { style: { ...kicker, marginBottom: "4px" } }, "Stages"),
                    h(Text, { style: { ...body, margin: "0", fontSize: "13px" } }, stages.join(" · ")),
                  )
                : null,
            ),
            audienceLine
              ? h(Text, { style: { ...small, marginTop: "12px" } }, audienceLine)
              : null,
          ),
        ),

        // Initial offer sheet: the deck's own rate card, nothing invented.
        offerSheet.length
          ? h(Section, { style: { padding: "0 32px 24px" } },
              h(Text, { style: { ...kicker, marginBottom: "10px" } }, "Initial offer sheet"),
              ...offerSheet.map(offerRow),
              h(Text, { style: { ...small, marginTop: "10px" } },
                "Ranges from the 2026 sponsorship deck. Every package adjusts to your goals."),
            )
          : null,

        // Exactly one ask.
        h(Section, { style: { padding: "0 32px 32px" } },
          h(Link, {
            href: callUrl,
            style: {
              display: "inline-block", backgroundColor: palette.accent, color: "#0a0a0f",
              fontFamily: stack, fontSize: "14px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1px",
              padding: "12px 22px", textDecoration: "none",
            },
          }, "Book fifteen minutes"),
        ),

        h(Hr, { style: { borderColor: palette.line, margin: "0" } }),

        // A person signs it.
        h(Section, { style: { padding: "20px 32px 28px" } },
          h(Text, { style: { ...body, margin: "0", fontWeight: 600 } }, senderName),
          h(Text, { style: { ...small, marginTop: "2px" } }, senderCompany),
          h(Text, { style: { ...small, marginTop: "14px", maxWidth: "420px" } },
            `You are receiving this because ${companyName} sponsors events in this category. `,
            h(Link, { href: optOutUrl, style: { color: palette.muted, textDecoration: "underline" } }, "Tell us to stop"),
            ".",
          ),
        ),
      ),
    ),
  );
}

// Placeholders for local preview only. Never a sample message, never sent.
SponsorPitch.PreviewProps = {
  recipientFirstName: "FIRST_NAME",
  companyName: "COMPANY_NAME",
  personalNote: "ONE_DATED_ACTIVATION_AND_THE_OFFER_IN_THE_SENDER_REGISTER",
  reasonSourceUrl: "https://example.com/source",
  festivalName: "FESTIVAL_NAME",
  festivalDates: "FESTIVAL_DATES",
  festivalVenue: "FESTIVAL_VENUE",
  festivalMarket: "FESTIVAL_MARKET",
  distanceNote: "DISTANCE_NOTE",
  stages: ["STAGE_A", "STAGE_B", "STAGE_C"],
  audienceLine: "AUDIENCE_FROM_THE_FESTIVAL_PACKET",
  offerSheet: [{ tier: "TIER_NAME", range: "$0K", includes: ["INCLUDE_A"] }],
  highlightTier: null,
  callUrl: "https://example.com/book",
  senderName: "SENDER_FULL_NAME",
  senderCompany: "SENDER_COMPANY",
  optOutUrl: "https://example.com/opt-out",
  previewText: "PREVIEW_TEXT_EXTENDS_THE_SUBJECT",
};

export default SponsorPitch;
