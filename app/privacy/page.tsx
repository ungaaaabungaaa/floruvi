import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacy notice",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <article className="page-width section prose-page">
      <span className="eyebrow">YOUR DETAILS, WITH CARE</span>
      <h1>Privacy notice</h1>
      <p>
        Updated 14 September 2026. This notice covers the current Floruvi
        enquiry website.
      </p>
      <h2>Information you choose to share</h2>
      <p>
        The enquiry form collects your name, email, city, message, and consent.
        You can also provide a phone number, produce interests, and quantities.
        Business enquiries include a business name. We use these details to
        review and respond to your request.
      </p>
      <h2>Where information is stored</h2>
      <p>
        Enquiries are stored privately in Floruvi’s Convex project in the EU
        West region. Website hosting processes the requests needed to serve
        these pages. Authorised project operators can access enquiry records.
        These records are not part of the public catalogue.
      </p>
      <h2>Abuse prevention</h2>
      <p>
        We use temporary request limits. We derive a keyed hash from your email
        and, on Vercel, your IP address. We do not store the raw IP address in
        enquiry records. The limits expire after one hour; expired limit records
        are removed during later successful submissions.
      </p>
      <h2>Optional services</h2>
      <p>
        This build does not include marketing analytics, advertising pixels,
        push notifications, payment collection, or customer accounts. We will
        update this notice before enabling services that change how information
        is used.
      </p>
      <h2>Your requests</h2>
      <p>
        To request access, correction, or deletion of enquiry details, use the
        contact form and describe your request. Do not include passwords,
        payment card details, or other sensitive information. The farm must
        verify ownership before it releases or changes personal records.
      </p>
      <p>
        Enquiry records currently remain until an authorised operator removes
        them. A regular retention schedule and a direct privacy contact must be
        set before the public launch.
      </p>
    </article>
  );
}
