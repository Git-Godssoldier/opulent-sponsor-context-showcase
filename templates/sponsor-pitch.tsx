// Sponsor pitch — React Email, Dither theme.
//
// Adapted from the Dither welcome template:
// https://github.com/resend/react-email/tree/canary/apps/demo/emails
//
// Two deliberate changes from the source layout. The welcome template offers three calls
// to action; this one offers exactly one, because a pitch asking for three things has not
// decided what it wants and hands that decision to a stranger in the second of attention
// they gave it. And the hero is the sponsor's own dated activation, not the festival —
// the festival is what we want, the activation is why they should care.
//
// Every prop below is filled from the run, never written from imagination:
//   reason / reasonSourceUrl  <- the sponsor's one dated activation, at its original strength
//   audienceLine              <- the festival packet's stated audience, verbatim
//   packageLine               <- the package band, only when the client supplied inventory
//   festivalName/Dates/Venue  <- the festival packet
//   callUrl                   <- the sender's own scheduling link
//
// There is deliberately no attendance prop. The two client-supplied figures do not
// reconcile — "more than 20,000 across three days" against "about 7,500 per day" — and
// they measure different things. A number that cannot survive one question from a sponsor
// is worse than no number, so the template gives it nowhere to go. When the client states
// one figure, add the prop then.
//
// A prop with no evidence behind it is omitted, and the section that would have used it
// does not render.

import {
  Body,
  Container,
  Column,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email';
import { DitherFonts } from './dither-fonts';
import { ditherTailwindConfig } from './theme';

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

interface SponsorPitchProps {
  /** First name only. A full name in a greeting reads as a mail merge. */
  recipientFirstName: string;
  /** The sponsor's company, as their own site writes it. */
  companyName: string;
  festivalName: string;
  /** Already formatted for a reader, e.g. "September 24 to 26". */
  festivalDates: string;
  festivalVenue: string;
  festivalMarket: string;
  /** The one dated, truthful reason this company is being written to now. */
  reason: string;
  /** The page that reason came from. Present whenever the reason is a public claim. */
  reasonSourceUrl?: string;
  /** The festival's stated audience. Ranges from the packet, never adjectives. */
  audienceLine: string;
  /** What a sponsor receives. Omitted entirely until the client supplies inventory. */
  packageLine?: string;
  /** The sender's own scheduling link. The single call to action. */
  callUrl: string;
  senderName: string;
  senderCompany: string;
  optOutUrl: string;
  /** Preview text. Extends the subject; never repeats it. */
  previewText: string;
}

export const SponsorPitch = ({
  recipientFirstName,
  companyName,
  festivalName,
  festivalDates,
  festivalVenue,
  festivalMarket,
  reason,
  reasonSourceUrl,
  audienceLine,
  packageLine,
  callUrl,
  senderName,
  senderCompany,
  optOutUrl,
  previewText,
}: SponsorPitchProps) => (
  <Tailwind config={ditherTailwindConfig}>
    <Html>
      <Head>
        <DitherFonts />
      </Head>
      <Body className="bg-bg-2 font-14 m-0 p-0 font-sans">
        <Preview>{previewText}</Preview>
        <Container className="bg-bg mx-auto max-w-[640px]">
          <Section className="mobile:px-4 px-6 py-6">
            <Img
              src={`${baseUrl}/static/shared/logo-white.png`}
              alt=""
              width="32"
              height="32"
              className="block"
            />
          </Section>

          {/* Why this arrived now, in their world. The festival comes second. */}
          <Section className="mobile:px-4 mobile:pt-10 mobile:pb-8 px-6 pt-16 pb-12">
            <Section align="left" className="mobile:!max-w-full max-w-[490px]">
              <Text className="font-14 text-fg-2 m-0 font-sans">
                {recipientFirstName} —
              </Text>
              <Text className="mobile:!max-w-full font-14 text-fg-2 m-0 mt-6 max-w-[490px] font-sans">
                {reason}
                {reasonSourceUrl ? (
                  <>
                    {' '}
                    <Link href={reasonSourceUrl} className="text-fg-2">
                      (source)
                    </Link>
                  </>
                ) : null}
              </Text>
              <Text className="mobile:!max-w-full font-56 font-condensed mobile:font-40 text-fg m-0 mt-8 max-w-[490px] uppercase">
                {festivalName}
              </Text>
            </Section>
          </Section>

          <Section className="mobile:px-4 px-6">
            <Img
              src={`${baseUrl}/static/dither/dither-image-1.png`}
              alt=""
              width={592}
              className="block w-full max-w-[592px]"
            />
          </Section>

          {/* The property in one block: when, where, who is on site. */}
          <Section className="mobile:px-4 mobile:pt-10 mobile:pb-8 px-6 pt-16 pb-12">
            <Text className="font-20 font-condensed text-fg m-0 uppercase">
              {festivalDates} · {festivalMarket}
            </Text>
            <Text className="font-13 text-fg-2 m-0 mt-2 font-sans">{festivalVenue}</Text>
            <Text className="mobile:!max-w-full font-14 text-fg-2 m-0 mt-6 max-w-[490px] font-sans">
              {audienceLine}
            </Text>
            {packageLine ? (
              <Text className="mobile:!max-w-full font-14 text-fg-2 m-0 mt-4 max-w-[490px] font-sans">
                {packageLine}
              </Text>
            ) : null}
          </Section>

          {/* Exactly one action, and it is small. */}
          <Section className="mobile:px-4 mobile:pb-10 border-stroke border-t px-6 pt-10 pb-14">
            <Link href={callUrl} className="font-20 font-condensed text-fg uppercase">
              Book fifteen minutes →
            </Link>
          </Section>

          {/* A person signs it, not a department. */}
          <Section className="mobile:px-4 mobile:py-12 border-stroke border-t px-6 py-16">
            <Text className="font-15 text-fg m-0 font-sans">{senderName}</Text>
            <Text className="font-13 text-fg-2 m-0 mt-0.5 font-sans">{senderCompany}</Text>
            <Row align="left">
              <Column className="w-full pt-8 align-top">
                <Text className="font-11 text-fg-2 m-0 max-w-[320px] font-sans">
                  You are receiving this because {companyName} sponsors events in this
                  category.{' '}
                  <Link href={optOutUrl} className="text-fg-2">
                    Tell us to stop
                  </Link>
                  .
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

// Preview props are placeholders for local rendering only. They are not a sample
// message and must never be sent.
SponsorPitch.PreviewProps = {
  recipientFirstName: 'FIRST_NAME',
  companyName: 'COMPANY_NAME',
  festivalName: 'FESTIVAL_NAME',
  festivalDates: 'FESTIVAL_DATES',
  festivalVenue: 'FESTIVAL_VENUE',
  festivalMarket: 'FESTIVAL_MARKET',
  reason: 'ONE_DATED_ACTIVATION_FROM_THE_DOSSIER',
  reasonSourceUrl: 'https://example.com/source',
  audienceLine: 'AUDIENCE_FROM_THE_FESTIVAL_PACKET',
  packageLine: undefined,
  callUrl: 'https://example.com/book',
  senderName: 'SENDER_NAME',
  senderCompany: 'SENDER_COMPANY',
  optOutUrl: 'https://example.com/opt-out',
  previewText: 'PREVIEW_TEXT_EXTENDS_THE_SUBJECT',
} satisfies SponsorPitchProps;

export default SponsorPitch;
