import { z } from "zod";

export const buyerGroups = [
  {
    id: "homes",
    label: "Homes & communities",
    examples:
      "Apartments, employee produce clubs, weekly boxes and farm markets",
  },
  {
    id: "hospitality",
    label: "Restaurants & hotels",
    examples: "Cafés, cloud kitchens, QSRs, resorts and event caterers",
  },
  {
    id: "corporate",
    label: "Corporate & factory kitchens",
    examples: "Office campuses, IT parks, factories and contracted caterers",
  },
  {
    id: "institutions",
    label: "Health, education & care",
    examples: "Hospitals, schools, colleges, hostels and care homes",
  },
  {
    id: "government",
    label: "Defence & public institutions",
    examples:
      "Army supply, police kitchens, public hospitals, hostels and prisons",
  },
  {
    id: "transport",
    label: "Transport catering",
    examples: "Railway base kitchens, licensed caterers and airline kitchens",
  },
  {
    id: "retail",
    label: "Retail & quick commerce",
    examples:
      "Organic stores, supermarkets, online grocers and category buyers",
  },
  {
    id: "wholesale",
    label: "Wholesale & distribution",
    examples: "Produce wholesalers, HoReCa suppliers and farmer organisations",
  },
  {
    id: "processing",
    label: "Processing & private label",
    examples: "Salad brands, juice makers, dehydrators and food processors",
  },
  {
    id: "export",
    label: "Export buyers",
    examples:
      "Importers, overseas distributors, merchant exporters and sales agents",
  },
  {
    id: "community",
    label: "Community kitchens",
    examples:
      "School-meal operators, charitable kitchens and paid meal procurement",
  },
] as const;
export const groupIds = buyerGroups.map((group) => group.id);
export type BuyerGroup = (typeof buyerGroups)[number]["id"];
export const groupSchema = z.enum(groupIds as [BuyerGroup, ...BuyerGroup[]]);

export function publicSourceUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      host.includes(".") &&
      !host.endsWith(".local") &&
      !host.endsWith(".localhost") &&
      !/^\d+\.\d+\.\d+\.\d+$/.test(host) &&
      !host.includes(":")
    );
  } catch {
    return false;
  }
}
export const sourceUrlSchema = z
  .string()
  .trim()
  .max(1500)
  .refine(publicSourceUrl, "Use a public HTTPS source link.");
const short = (max: number) => z.string().trim().max(max);
export const researchRequestSchema = z
  .object({
    kind: z.enum(["buyers", "tenders", "export"]),
    groups: z
      .array(groupSchema)
      .min(1)
      .max(11)
      .transform((groups) => [...new Set(groups)]),
    region: short(160).min(2),
    products: short(500).min(2),
    limit: z.number().int().min(1).max(20),
    useExa: z.boolean(),
  })
  .strict();
export type ResearchRequest = z.infer<typeof researchRequestSchema>;

export const opportunitySchema = z
  .object({
    kind: z.enum(["buyer", "tender", "export"]),
    name: short(180).min(2),
    group: groupSchema,
    location: short(180),
    website: z.union([z.literal(""), sourceUrlSchema]),
    contact: short(250),
    role: short(180),
    summary: short(2000),
    productFit: short(1000),
    sourceUrl: sourceUrlSchema,
    sourceTitle: short(200).min(1),
    nextStep: short(1000),
    tenderReference: short(180),
    deadline: short(100),
    requirements: short(2000),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.kind === "tender" && !value.tenderReference)
      ctx.addIssue({
        code: "custom",
        path: ["tenderReference"],
        message: "A tender needs its official reference.",
      });
  });
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export const opportunityStatuses = [
  "found",
  "reviewed",
  "qualified",
  "contacted",
  "won",
  "not-fit",
  "do-not-contact",
] as const;
export const sourceSchema = z
  .object({ url: sourceUrlSchema, title: short(200) })
  .strict();
export const researchResultSchema = z
  .object({
    summary: short(6000),
    opportunities: z.array(opportunitySchema).max(20),
    sources: z.array(sourceSchema).max(40),
    nextSteps: z.array(short(600)).max(10),
  })
  .strict();
export type ResearchResult = z.infer<typeof researchResultSchema>;
export const supplyProfileSchema = z
  .object({
    origin: short(200),
    products: short(1500),
    capacity: short(1000),
    delivery: short(1000),
    certifications: short(1000),
    terms: short(1000),
  })
  .strict();
export type SupplyProfile = z.infer<typeof supplyProfileSchema>;
export const emptySupplyProfile: SupplyProfile = {
  origin: "",
  products: "",
  capacity: "",
  delivery: "",
  certifications: "",
  terms: "",
};
export const draftSchema = z
  .object({
    id: short(100).optional(),
    title: short(180).min(2),
    body: short(6000).min(5),
    opportunityId: short(100),
    idempotencyKey: short(120).optional(),
  })
  .strict();
export const channelStatuses = [
  "not-started",
  "in-progress",
  "ready",
  "blocked",
] as const;
export const channels = [
  {
    id: "google-merchant",
    name: "Google Merchant Center",
    url: "https://merchants.google.com/",
    purpose: "Product listings",
    setup:
      "Verify the domain, checkout, price, stock, shipping and returns before activating the feed.",
  },
  {
    id: "search-console",
    name: "Google Search Console",
    url: "https://search.google.com/search-console",
    purpose: "Search visibility",
    setup: "Verify domain ownership and submit the sitemap.",
  },
  {
    id: "bing",
    name: "Bing Webmaster Tools",
    url: "https://www.bing.com/webmasters",
    purpose: "Search visibility",
    setup: "Verify the site and submit the sitemap.",
  },
  {
    id: "google-business",
    name: "Google Business Profile",
    url: "https://www.google.com/business/",
    purpose: "Local discovery",
    setup: "Confirm eligibility and the real service location before applying.",
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    url: "https://analytics.google.com/",
    purpose: "Acquisition and campaigns",
    setup:
      "Add a measurement ID, consent controls and verified ecommerce events.",
  },
  {
    id: "posthog",
    name: "PostHog",
    url: "https://app.posthog.com/",
    purpose: "Product funnels and errors",
    setup:
      "Add project access, apply the shared event plan and exclude private surfaces.",
  },
  {
    id: "meta",
    name: "Meta Business Suite",
    url: "https://business.facebook.com/",
    purpose: "Facebook and Instagram",
    setup: "Connect the business accounts. Review each post before publishing.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    url: "https://business.whatsapp.com/",
    purpose: "Inbound enquiries and approved updates",
    setup:
      "Set up the business number and recipient opt-in. Use approved templates where required.",
  },
  {
    id: "buffer",
    name: "Buffer",
    url: "https://buffer.com/",
    purpose: "Social drafts and scheduling",
    setup:
      "Connect social accounts and publish approved drafts in the vendor tool.",
  },
  {
    id: "hyperpure",
    name: "Hyperpure",
    url: "https://seller.hyperpure.com/",
    purpose: "Restaurant supply",
    setup:
      "Confirm supplier admission, service city, product grades and payment terms.",
  },
  {
    id: "udaan",
    name: "Udaan",
    url: "https://udaan.com/pages/sell-on-udaan",
    purpose: "Trade distribution",
    setup: "Check produce categories, admission, credit terms and fulfilment.",
  },
  {
    id: "indiamart",
    name: "IndiaMART",
    url: "https://www.indiamart.com/",
    purpose: "Business enquiries",
    setup:
      "Prepare a supplier profile, minimum order, capacity and enquiry response process.",
  },
  {
    id: "tradeindia",
    name: "TradeIndia",
    url: "https://www.tradeindia.com/",
    purpose: "Business enquiries",
    setup: "Prepare product sheets and verify leads before paying for plans.",
  },
  {
    id: "ondc",
    name: "ONDC seller network",
    url: "https://www.ondc.org/pages/seller-network-participants.html",
    purpose: "Network commerce",
    setup:
      "Choose a seller participant that supports perishables and the delivery area.",
  },
  {
    id: "quick-commerce",
    name: "Retail and quick commerce",
    url: "https://www.bigbasket.com/",
    purpose: "Category buyers and supplier applications",
    setup:
      "Compare BigBasket, Blinkit, Zepto, Instamart and JioMart. Confirm actual supplier terms.",
  },
  {
    id: "gem",
    name: "GeM",
    url: "https://gem.gov.in/",
    purpose: "Government procurement",
    setup:
      "Register through the official route; check each bid's eligibility, deposits and delivery terms.",
  },
  {
    id: "cppp",
    name: "Central Public Procurement",
    url: "https://eprocure.gov.in/epublish/app",
    purpose: "Central tenders and contract awards",
    setup:
      "Check amendments, deadlines and actual buying entities. Awarded caterers can be produce prospects.",
  },
  {
    id: "defence",
    name: "Defence eProcurement",
    url: "https://defproc.gov.in/nicgep/app",
    purpose: "Defence and ASC supply",
    setup:
      "Find fresh-food notices; separate Army supply from CSD retail product introduction.",
  },
  {
    id: "kppp",
    name: "Karnataka procurement",
    url: "https://kppp.karnataka.gov.in/",
    purpose: "State institutions and tenders",
    setup:
      "Check supplier registration, signature requirements and bid-specific conditions.",
  },
  {
    id: "railways",
    name: "Railway procurement",
    url: "https://www.ireps.gov.in/",
    purpose: "Railway supply and caterer discovery",
    setup:
      "Separate raw-material supply, packaged products and catering contracts.",
  },
  {
    id: "apeda",
    name: "APEDA AgriExchange",
    url: "https://agriexchange.apeda.gov.in/",
    purpose: "Export research and buyers",
    setup:
      "Verify the buyer and product-country requirements. A listing does not prove eligibility.",
  },
  {
    id: "trade-connect",
    name: "DGFT Trade Connect",
    url: "https://www.trade.gov.in/",
    purpose: "Export market information",
    setup: "Check current product, destination and document requirements.",
  },
  {
    id: "fieo",
    name: "FIEO",
    url: "https://fieo.org/",
    purpose: "Buyer events and export support",
    setup: "Confirm event access, costs and relevant buyers.",
  },
  {
    id: "alibaba",
    name: "Alibaba.com",
    url: "https://seller.alibaba.com/",
    purpose: "International buyer discovery",
    setup:
      "Prove export capacity and compare membership costs before subscribing.",
  },
] as const;

export type ProviderId = "openai" | "exa" | "apollo";
export type ProviderState = {
  id: ProviderId;
  configured: boolean;
  testedAt?: number;
  ok?: boolean;
  message?: string;
};
export type Opportunity = OpportunityInput & {
  _id: string;
  status: (typeof opportunityStatuses)[number];
  notes: string;
  createdAt: number;
  updatedAt: number;
  runId?: string;
};
export type GrowthRun = {
  _id: string;
  request: ResearchRequest;
  status: "queued" | "running" | "complete" | "failed" | "cancelled";
  createdAt: number;
  finishedAt?: number;
  summary?: string;
  error?: string;
  sources?: { url: string; title: string }[];
  nextSteps?: string[];
  reservationMicros: number;
  costMicros?: number;
};
export type GrowthDraft = {
  _id: string;
  title: string;
  body: string;
  opportunityId: string;
  createdAt: number;
};
export type GrowthDashboard = {
  profile: SupplyProfile;
  opportunities: Opportunity[];
  runs: GrowthRun[];
  drafts: GrowthDraft[];
  channels: {
    id: string;
    status: (typeof channelStatuses)[number];
    notes: string;
    updatedAt: number;
  }[];
  providers: ProviderState[];
  usage: {
    budgetMicros: number;
    reservedMicros: number;
    chargedMicros: number;
    month: string;
    dailyRuns: number;
    apolloUsed: number;
    apolloLimit: number;
  };
  enabled: boolean;
  mcpConfigured: boolean;
};
export type GrowthActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  data?: unknown;
};

export function opportunityKey(item: OpportunityInput) {
  if (item.kind === "tender")
    return `tender:${new URL(item.sourceUrl).hostname}:${item.tenderReference.toLowerCase().trim()}`;
  const domain = item.website
    ? new URL(item.website).hostname.replace(/^www\./, "")
    : item.name.toLowerCase().trim();
  return `${item.kind}:${domain}:${item.name.toLowerCase().trim()}:${item.location.toLowerCase().trim()}`;
}
export function usdLabel(micros: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(micros / 1_000_000);
}
