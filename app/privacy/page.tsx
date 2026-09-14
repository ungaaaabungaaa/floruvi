import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import freshlyPicked from "@/src/assets/recipes/banners/freshly-picked.webp";
import colourfulTable from "@/src/assets/recipes/banners/colourful-table.webp";
import slowMornings from "@/src/assets/recipes/banners/slow-mornings.webp";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How Floruvi handles enquiries, browser storage, saved products & privacy requests.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    id: "about",
    title: "About this notice",
    paragraphs: [
      "This notice explains how information is used when you browse Floruvi, save products, build a basket, or send an enquiry. It covers the current website, including the shop, boxes, recipes, contact form & business enquiry form. It describes the features available today.",
      "Browsing does not require a customer account. Sending an availability request gives the farm information to review your needs & respond. It does not create an account, collect a payment, reserve produce, or activate recurring billing. References to checkout in this notice describe that request process.",
    ],
  },
  {
    id: "information",
    title: "Information you share with us",
    paragraphs: [
      "The enquiry forms ask for your name, email address, city, message & consent to use those details to respond. Depending on the form, you can also share a phone number, produce interests, quantities & other information about your request. Business enquiries include your business name.",
      "Please share only information needed for the enquiry. For example, a crop list, delivery area & expected quantity help the farm understand a business request. Do not include passwords, payment card numbers, identity documents, medical records, or private information about another person in a message.",
    ],
  },
  {
    id: "use",
    title: "How enquiry information is used",
    paragraphs: [
      "The farm uses the information you submit to understand your request, review the selected produce, assess delivery needs & respond through the contact details you provide. The request record includes a submission time, a consent time & a status used to organise enquiries.",
      "A consent checkbox is required before the enquiry can be submitted. This consent relates to handling your request. The current website does not turn a contact enquiry into a newsletter subscription or enrol you in an advertising campaign. Check the details in your form before you send it.",
    ],
  },
  {
    id: "basket",
    title: "Your basket & box choices",
    paragraphs: [
      "The basket stores product identifiers & quantities in your browser. For a box, its identifier also records the selected box size & delivery frequency. This lets the website show your choices when you return in the same browser. Contact details are not part of this saved basket.",
      "Adding an item to the basket does not send an enquiry. You can change quantities or remove items before submitting a request. Clearing this website’s browser storage removes the saved basket from that browser. It does not cancel or delete a request that you have already sent to the farm.",
    ],
  },
  {
    id: "wishlist",
    title: "Your wishlist & recipe preferences",
    paragraphs: [
      "The wishlist stores the names & identifiers of saved products in local browser storage. It supports the heart controls & the saved-product count. The current wishlist is not linked to a customer account or synchronised across devices. Another person using the same browser profile may be able to see those saved items.",
      "Recipe browsing also uses session storage to keep the order of recipe cards consistent during a browsing session. This stores a display preference rather than your contact details. You can remove local preferences through your browser’s site-data controls. Private browsing or blocked storage can limit how long these features remember your choices.",
    ],
  },
  {
    id: "checkout",
    title: "Checkout & delivery details",
    paragraphs: [
      "Contact & delivery fields entered at checkout remain in page memory until you send the availability request. The submitted request includes your contact details, selected crops or box, delivery area & notes. The optional street-address field is not included in the submitted request or saved in the enquiry record.",
      "Unsubmitted form details are not stored in the Floruvi basket. Leaving or reloading the page can remove them. Your browser may separately offer autofill or remember form entries under its own settings. Review those settings if you use a shared device or do not want your browser to suggest personal details.",
    ],
  },
  {
    id: "storage",
    title: "Where enquiries are stored",
    paragraphs: [
      "Submitted enquiries are stored in Floruvi’s Convex project in the EU West region. They are kept separately from the public product catalogue. Authorised project operators can access enquiry records to manage requests. The public shop & recipe pages do not expose these private enquiry records.",
      "Website hosting processes the requests needed to deliver pages, images & form responses. Floruvi uses Vercel for hosting & Convex for application data. Visiting the website therefore involves these infrastructure services. Information submitted from another country may be processed outside that country as part of this setup.",
    ],
  },
  {
    id: "protection",
    title: "Form protection & request limits",
    paragraphs: [
      "The website checks submitted fields before an enquiry is stored. These checks include required fields, length limits, contact formats & a form field used to detect automated submissions. Requests that do not pass validation are rejected. These controls help protect the enquiry service from invalid or excessive requests.",
      "Temporary submission limits use keyed hashes derived from your email address &, on Vercel, your IP address. The raw IP address is not stored in the enquiry record. A limit window lasts one hour. Expired limit records are removed in batches during later successful submissions, so expiry does not mean immediate deletion of every limit record.",
    ],
  },
  {
    id: "services",
    title: "Cookies, analytics & optional services",
    paragraphs: [
      "The basket & wishlist features described here use local storage. Recipe display preferences use session storage. These are browser-storage mechanisms rather than an account-based profile. Your browser controls whether site storage is available & provides options to clear it. Disabling storage can affect saved choices without preventing you from reading the public pages.",
      "The current application does not include marketing analytics, advertising pixels, push notifications, payment collection, or active customer accounts. Hosting services still process technical requests needed to operate the site. This notice must be reviewed when a new service changes the information collected, its purpose, or where it is sent.",
    ],
  },
  {
    id: "retention",
    title: "How long information remains",
    paragraphs: [
      "Enquiry records currently remain in the private project until an authorised operator removes them. There is no automatic enquiry-deletion schedule in the current application. A regular retention schedule & a direct privacy contact still need to be set. This notice does not promise an automatic deletion date that the service does not yet enforce.",
      "Browser data follows a different lifecycle. Local basket & wishlist data can remain until you remove items, clear site data, or the browser removes it. Session preferences normally last for the browsing session, subject to browser behaviour. Removing data from your device does not remove a separate enquiry held by the farm.",
    ],
  },
  {
    id: "requests",
    title: "Access, corrections & deletion requests",
    paragraphs: [
      "Use the contact form if you want to ask about an enquiry record, correct a detail, or request its deletion. State that your message concerns privacy & provide enough context to identify the request, such as the email address used & an approximate submission date. Avoid including extra sensitive information.",
      "The farm needs to verify ownership before it releases or changes personal records. Do not send identity documents through the general enquiry form unless a suitable process has first been agreed. A privacy request is reviewed by an operator; submitting it does not automatically edit or erase a record. This site does not yet provide a self-service account dashboard for that purpose.",
    ],
  },
  {
    id: "choices",
    title: "Your choices on a shared device",
    paragraphs: [
      "You can browse the shop & read recipes without submitting a form. You can remove a saved product through the wishlist, adjust your basket, or use browser settings to clear this website’s stored data. A different device or browser profile has its own saved choices because account synchronisation is not active.",
      "If you share a device, close any page containing unsubmitted contact details when you finish. Consider clearing saved items if you do not want the next person using that browser to see them. Browser autofill, browsing history & device backups are controlled outside the Floruvi application.",
    ],
  },
  {
    id: "links",
    title: "Links to other websites",
    paragraphs: [
      "Some pages link to external food or growing references. Following an external link opens a service operated by another organisation. Its privacy notice & browser-storage practices apply when you visit it. A reference link does not give that organisation access to your private Floruvi enquiry record through this application.",
      "Read the destination’s notice before providing personal information there. If you contact the farm through a separate communication service, that service may also process your message under its own terms. This notice describes the Floruvi website & does not replace the notices of those other services.",
    ],
  },
  {
    id: "updates",
    title: "Updates & getting in touch",
    paragraphs: [
      "This notice will need to change as the storefront develops. Customer accounts, payment processing, delivery integrations, or new communication tools can introduce different data flows. The date at the top identifies the latest revision of this page. Review the notice when you use a newly introduced feature.",
      "For a question about the current website or an existing enquiry, use the contact page. Describe what you want to know in plain language & include only the details needed to find your request. The same form can be used to flag a possible privacy problem for the farm to review.",
    ],
  },
];
const banners = [
  {
    after: 3,
    image: freshlyPicked,
    title: "Fresh food. Clear information.",
    style: "right",
    alt: "A basket filled with fresh vegetables",
  },
  {
    after: 7,
    image: colourfulTable,
    title: "A little clarity goes a long way.",
    style: "warm left",
    alt: "Colourful vegetables prepared for the table",
  },
  {
    after: 10,
    image: slowMornings,
    title: "Take your time. Know your choices.",
    style: "right",
    alt: "Avocado toast & a green smoothie in morning light",
  },
];
export default function Privacy() {
  return (
    <article className="page-width section privacy-page">
      <header className="privacy-intro">
        <span className="eyebrow">YOUR DETAILS, WITH CARE</span>
        <h1>Privacy notice</h1>
        <p>What you share. Where it stays. The choices you have.</p>
        <time dateTime="2026-09-15">Updated 15 September 2026</time>
      </header>
      <nav className="privacy-contents" aria-label="Privacy notice contents">
        <h2>In this notice</h2>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>
      {sections.map((section, index) => {
        const banner = banners.find((item) => item.after === index);
        return (
          <Fragment key={section.id}>
            <section
              className="privacy-section"
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
            >
              <span className="privacy-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
            {banner && (
              <aside
                className={`recipe-banner recipe-interlude privacy-banner ${banner.style}`}
                aria-label={banner.title}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="(max-width: 800px) 100vw, 1200px"
                  className="recipe-banner-photo"
                />
                <div className="recipe-banner-copy">
                  <h2>{banner.title}</h2>
                </div>
              </aside>
            )}
          </Fragment>
        );
      })}
      <div className="privacy-contact">
        <p>Have a privacy question?</p>
        <Link className="text-link" href="/contact">
          Contact us →
        </Link>
      </div>
    </article>
  );
}
