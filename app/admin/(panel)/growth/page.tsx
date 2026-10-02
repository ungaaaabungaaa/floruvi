import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminApi, adminToken } from "@/lib/admin";
import {
  buyerGroups,
  channels,
  channelStatuses,
  opportunityStatuses,
  publicSourceUrl,
  usdLabel,
  type GrowthActionResult,
  type GrowthDashboard,
  type GrowthRun,
  type Opportunity,
} from "@/lib/growth";
import { Filters, when } from "../shared";
import {
  ActionForm,
  ApolloSearch,
  DraftEditor,
  OpportunityForm,
  ResearchForm,
  ResearchRefresh,
} from "./client";
import "../../growth.css";

export const metadata: Metadata = { title: "Growth" };
const views = ["opportunities", "research", "channels", "drafts"] as const;
const statusLabel = (value: string) => value.replaceAll("-", " ");
const groupLabel = (id: string) =>
  buyerGroups.find((group) => group.id === id)?.label || id;

function SourceLink({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return publicSourceUrl(url) ? (
    <a
      className="admin-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
    >
      {children}
      <span className="growth-sr-only"> (opens a new tab)</span>
    </a>
  ) : (
    <span>{children} (link unavailable)</span>
  );
}

async function loadGrowth() {
  const token = await adminToken();
  if (!token) redirect("/admin/login");
  const response = await adminApi("growth", {
    token,
    operation: "dashboard",
    payload: {},
  }).catch(() => null);
  if (response?.status === 401) redirect("/admin/login");
  if (!response?.ok) return null;
  const result = (await response.json().catch(() => null)) as
    (GrowthActionResult & { data?: GrowthDashboard }) | null;
  return result?.ok && result.data ? result.data : null;
}

export default async function GrowthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [data, params] = await Promise.all([loadGrowth(), searchParams]);
  if (!data)
    return (
      <>
        <h1>Growth</h1>
        <p className="admin-error" role="alert">
          The Growth service is not available. Check the backend deployment and
          ADMIN_API_SECRET in Vercel and Convex. Saved records are not shown
          until the service responds.
        </p>
      </>
    );
  const view = views.find((value) => value === params.view) || "opportunities";
  const active = data.runs.some(
    (run) => run.status === "queued" || run.status === "running",
  );
  return (
    <div className="growth-workspace">
      <div className="growth-heading">
        <div>
          <p className="admin-eyebrow">Find and review buyers</p>
          <h1>Growth</h1>
        </div>
        <Link className="admin-button ghost" href="/admin/growth?view=research">
          Research buyers
        </Link>
      </div>
      <p className="admin-muted">
        Keep buyer evidence, source links and next steps in one place. Review
        each opportunity before contact.
      </p>
      <Filters
        label="Growth views"
        options={views.map((value) => ({
          href: `/admin/growth?view=${value}`,
          label:
            value === "drafts"
              ? "Drafts & results"
              : value[0].toUpperCase() + value.slice(1),
          current: view === value,
          count:
            value === "opportunities"
              ? data.opportunities.length
              : value === "drafts"
                ? data.drafts.length
                : value === "research"
                  ? data.runs.length
                  : undefined,
        }))}
      />
      <details className="admin-order growth-profile">
        <summary className="admin-order-head">
          <strong>Supply profile</strong>
          <span className="admin-muted">
            {data.profile.origin || "Add dispatch location and available crops"}
          </span>
        </summary>
        <p className="admin-muted">
          Research uses these details. Leave unknown details blank. A saved
          claim still needs evidence.
        </p>
        <ActionForm operation="saveProfile" label="Save supply profile">
          <div className="growth-form-grid">
            <label>
              Origin and dispatch location
              <input
                name="origin"
                maxLength={200}
                defaultValue={data.profile.origin}
              />
            </label>
            <label>
              Products, grades and packs
              <textarea
                name="products"
                maxLength={1500}
                rows={3}
                defaultValue={data.profile.products}
              />
            </label>
            <label>
              Weekly capacity and seasonal limits
              <textarea
                name="capacity"
                maxLength={1000}
                rows={3}
                defaultValue={data.profile.capacity}
                placeholder="Record available kilograms and minimum order."
              />
            </label>
            <label>
              Delivery and export capability
              <textarea
                name="delivery"
                maxLength={1000}
                rows={3}
                defaultValue={data.profile.delivery}
              />
            </label>
            <label>
              Certificates and expiry dates
              <textarea
                name="certifications"
                maxLength={1000}
                rows={3}
                defaultValue={data.profile.certifications}
                placeholder="Include issuer, scope, product, expiry date and evidence link."
              />
            </label>
            <label>
              Prices, margin and credit limits
              <textarea
                name="terms"
                maxLength={1000}
                rows={3}
                defaultValue={data.profile.terms}
              />
            </label>
          </div>
        </ActionForm>
      </details>
      {view === "opportunities" && (
        <Opportunities data={data} params={params} />
      )}
      {view === "research" && <Research data={data} active={active} />}
      {view === "channels" && <Channels data={data} />}
      {view === "drafts" && <Drafts data={data} />}
    </div>
  );
}

function Opportunities({
  data,
  params,
}: {
  data: GrowthDashboard;
  params: Record<string, string | string[] | undefined>;
}) {
  const group = buyerGroups.find((item) => item.id === params.group)?.id || "";
  const status =
    opportunityStatuses.find((item) => item === params.status) || "";
  const kind =
    ["buyer", "tender", "export"].find((item) => item === params.kind) || "";
  const query =
    typeof params.q === "string" ? params.q.slice(0, 200).trim() : "";
  const normalized = query.toLowerCase();
  const filtered = data.opportunities.filter(
    (item) =>
      (!group || item.group === group) &&
      (!status || item.status === status) &&
      (!kind || item.kind === kind) &&
      (!normalized ||
        [
          item.name,
          item.location,
          item.productFit,
          item.role,
          item.contact,
          item.summary,
        ].some((value) => value.toLowerCase().includes(normalized))),
  );
  const groupUrl = (id?: string) => {
    const search = new URLSearchParams({ view: "opportunities" });
    if (id) search.set("group", id);
    if (status) search.set("status", status);
    if (kind) search.set("kind", kind);
    if (query) search.set("q", query);
    return `/admin/growth?${search}`;
  };
  return (
    <>
      <section aria-labelledby="buyer-groups-title">
        <h2 id="buyer-groups-title">Buyer groups</h2>
        <p className="admin-muted">
          Counts include saved records at every review stage.
        </p>
        <nav aria-label="Buyer groups" className="growth-groups">
          <Link href={groupUrl()} aria-current={!group ? "page" : undefined}>
            <span>All groups</span>
            <strong>{data.opportunities.length}</strong>
          </Link>
          {buyerGroups.map((item) => (
            <Link
              href={groupUrl(item.id)}
              key={item.id}
              aria-current={group === item.id ? "page" : undefined}
              title={item.examples}
            >
              <span>{item.label}</span>
              <strong>
                {
                  data.opportunities.filter(
                    (opportunity) => opportunity.group === item.id,
                  ).length
                }
              </strong>
            </Link>
          ))}
        </nav>
      </section>
      <section aria-labelledby="opportunity-title">
        <div className="growth-heading">
          <h2 id="opportunity-title">
            {group ? groupLabel(group) : "All opportunities"}
          </h2>
          <span>{filtered.length} shown</span>
        </div>
        <form method="get" className="admin-form growth-filter-form">
          <input type="hidden" name="view" value="opportunities" />
          <input type="hidden" name="group" value={group} />
          <div className="growth-form-grid">
            <label>
              Business, product, location or role
              <input
                type="search"
                name="q"
                defaultValue={query}
                maxLength={200}
              />
            </label>
            <label>
              Record type
              <select name="kind" defaultValue={kind}>
                <option value="">All types</option>
                <option value="buyer">Buyer</option>
                <option value="tender">Tender</option>
                <option value="export">Export</option>
              </select>
            </label>
            <label>
              Review stage
              <select name="status" defaultValue={status}>
                <option value="">All stages</option>
                {opportunityStatuses.map((value) => (
                  <option key={value} value={value}>
                    {statusLabel(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="growth-actions">
            <button className="admin-button ghost">Apply filters</button>
            <Link className="admin-link" href={groupUrl().split("&")[0]}>
              Clear filters
            </Link>
          </div>
        </form>
        {filtered.length === 0 ? (
          <div className="growth-empty">
            <h3>No saved opportunities{group ? " in this group" : ""}.</h3>
            <p>
              Add a source below or start a research run. Empty groups remain
              visible.
            </p>
          </div>
        ) : (
          <ul className="admin-orders">
            {filtered.map((item) => (
              <OpportunityCard key={item._id} item={item} />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="add-opportunity-title">
        <details className="admin-order">
          <summary className="admin-order-head">
            <h2 id="add-opportunity-title">Add an opportunity</h2>
          </summary>
          <OpportunityForm />
        </details>
      </section>
    </>
  );
}

function OpportunityCard({ item }: { item: Opportunity }) {
  return (
    <li className="admin-order growth-opportunity">
      <div className="admin-order-head">
        <h3>{item.name}</h3>
        <span className="admin-tag">{statusLabel(item.status)}</span>
        <span
          className={`admin-tag${item.kind === "tender" ? " business" : " created"}`}
        >
          {item.kind}
        </span>
      </div>
      <p className="admin-muted">
        {groupLabel(item.group)} · {item.location || "Location not recorded"}
      </p>
      <dl>
        <dt>Buying role</dt>
        <dd>{item.role || "Not verified"}</dd>
        <dt>Public contact</dt>
        <dd>{item.contact || "Not recorded"}</dd>
        <dt>Product fit</dt>
        <dd>{item.productFit || "Not assessed"}</dd>
        <dt>Evidence</dt>
        <dd>{item.summary || "No summary recorded"}</dd>
        <dt>Source</dt>
        <dd>
          <SourceLink url={item.sourceUrl}>{item.sourceTitle}</SourceLink>
        </dd>
        {item.website && (
          <>
            <dt>Business site</dt>
            <dd>
              <SourceLink url={item.website}>{item.website}</SourceLink>
            </dd>
          </>
        )}
        <dt>Record updated</dt>
        <dd>{when(item.updatedAt)} IST</dd>
        <dt>Next step</dt>
        <dd>{item.nextStep || "Add the next step in review notes"}</dd>
      </dl>
      {item.kind === "tender" && (
        <div className="growth-tender">
          <h4>Tender details</h4>
          <dl>
            <dt>Reference</dt>
            <dd>{item.tenderReference}</dd>
            <dt>Deadline</dt>
            <dd>{item.deadline || "Not verified"}</dd>
            <dt>Requirements</dt>
            <dd className="growth-preserve">
              {item.requirements ||
                "Eligibility, deposits and delivery terms need review"}
            </dd>
          </dl>
          <p className="admin-muted">
            Check the official notice, time zone and amendments before any bid.
          </p>
        </div>
      )}
      <details className="growth-review">
        <summary>Review status and notes</summary>
        <ActionForm operation="updateOpportunity" label="Save review">
          <input type="hidden" name="id" value={item._id} />
          <label>
            Review stage
            <select name="status" defaultValue={item.status}>
              {opportunityStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Review notes
            <textarea
              name="notes"
              maxLength={2000}
              rows={3}
              defaultValue={item.notes}
              placeholder="Record evidence, supply gaps, contact permission and the next step."
            />
          </label>
          <p className="admin-muted">
            Mark contacted or won only when you have evidence. Changing a stage
            does not send a message.
          </p>
        </ActionForm>
      </details>
    </li>
  );
}

function Research({
  data,
  active,
}: {
  data: GrowthDashboard;
  active: boolean;
}) {
  const openai = data.providers.find((provider) => provider.id === "openai");
  const exa = data.providers.find((provider) => provider.id === "exa");
  return (
    <>
      <section aria-labelledby="research-budget-title">
        <h2 id="research-budget-title">Research budget</h2>
        <p className="admin-muted">
          {data.usage.month} · Separate from website chat
        </p>
        <dl className="growth-budget">
          <div>
            <dt>Monthly limit</dt>
            <dd>{usdLabel(data.usage.budgetMicros)}</dd>
          </div>
          <div>
            <dt>Recorded charges</dt>
            <dd>{usdLabel(data.usage.chargedMicros)}</dd>
          </div>
          <div>
            <dt>Reserved for runs</dt>
            <dd>{usdLabel(data.usage.reservedMicros)}</dd>
          </div>
          <div>
            <dt>Runs today</dt>
            <dd>{data.usage.dailyRuns}</dd>
          </div>
        </dl>
        <p className="admin-muted">
          Reservations can include uncertain provider charges. The provider
          billing page is the final billing record.
        </p>
      </section>
      <section aria-labelledby="start-research-title">
        <h2 id="start-research-title">Start research</h2>
        <p className="admin-muted">
          Find buying routes and cited evidence. A result is a candidate for
          review.
        </p>
        <ResearchForm
          profile={data.profile}
          enabled={data.enabled}
          hasOpenAI={Boolean(openai?.configured)}
          hasExa={Boolean(exa?.configured)}
          active={active}
        />
      </section>
      <section aria-labelledby="runs-title">
        <div className="growth-heading">
          <h2 id="runs-title">Research runs</h2>
        </div>
        <ResearchRefresh active={active} />
        {data.runs.length === 0 ? (
          <div className="growth-empty">
            <h3>No research runs yet.</h3>
            <p>
              Configure OpenAI in Channels. Then approve the server budget and
              start a run.
            </p>
          </div>
        ) : (
          <ul className="admin-orders">
            {data.runs.map((run) => (
              <RunCard key={run._id} run={run} />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="apollo-title">
        <h2 id="apollo-title">Apollo contact research</h2>
        <p className="admin-muted">
          Credits used or reserved this month: {data.usage.apolloUsed} of{" "}
          {data.usage.apolloLimit} allowed.
        </p>
        <ApolloSearch
          configured={Boolean(
            data.providers.find((provider) => provider.id === "apollo")
              ?.configured,
          )}
          creditsAvailable={data.usage.apolloLimit > data.usage.apolloUsed}
        />
      </section>
    </>
  );
}

function RunCard({ run }: { run: GrowthRun }) {
  const active = run.status === "queued" || run.status === "running";
  return (
    <li className="admin-order">
      <div className="admin-order-head">
        <h3>
          {run.request.kind === "tenders"
            ? "Tender research"
            : run.request.kind === "export"
              ? "Export research"
              : "Buyer research"}
        </h3>
        <span
          className={`admin-tag${run.status === "failed" ? " review" : ""}`}
        >
          {run.status}
        </span>
        <time>{when(run.createdAt)} IST</time>
      </div>
      <p>
        {run.request.products} · {run.request.region}
      </p>
      <p className="admin-muted">
        {run.request.groups.map(groupLabel).join(" · ")}
      </p>
      {active && (
        <p role="status">
          {run.status === "queued"
            ? "Waiting for the research worker."
            : "Research is in progress. Sources and results will appear when the run finishes."}
        </p>
      )}
      {run.error && <p className="admin-error">{run.error}</p>}
      {run.summary && <p className="growth-preserve">{run.summary}</p>}
      <p className="admin-muted">
        Reserved: {usdLabel(run.reservationMicros)} · Recorded cost:{" "}
        {run.costMicros === undefined
          ? "not confirmed"
          : usdLabel(run.costMicros)}
        {run.finishedAt ? ` · Finished ${when(run.finishedAt)} IST` : ""}
      </p>
      {run.sources && run.sources.length > 0 && (
        <details className="growth-review">
          <summary>Sources ({run.sources.length})</summary>
          <ul>
            {run.sources.map((source, index) => (
              <li key={`${source.url}-${index}`}>
                <SourceLink url={source.url}>
                  {source.title || source.url}
                </SourceLink>
              </li>
            ))}
          </ul>
        </details>
      )}
      {run.nextSteps && run.nextSteps.length > 0 && (
        <>
          <h4>Suggested next steps</h4>
          <ol>
            {run.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </>
      )}
      {active && (
        <ActionForm operation="cancelResearch" label="Cancel research">
          <input name="id" type="hidden" value={run._id} />
          <p className="admin-muted">
            Cancellation stops further work. Calls already in progress may still
            incur charges.
          </p>
        </ActionForm>
      )}
    </li>
  );
}

const providerSetup = {
  openai: {
    name: "OpenAI",
    key: "OPENAI_API_KEY",
    url: "https://platform.openai.com/api-keys",
    purpose:
      "Cited buyer, tender and export research. API billing is separate from a ChatGPT subscription.",
  },
  exa: {
    name: "Exa",
    key: "EXA_API_KEY",
    url: "https://dashboard.exa.ai/api-keys",
    purpose:
      "Optional source search. The access check does not run a paid search.",
  },
  apollo: {
    name: "Apollo",
    key: "APOLLO_API_KEY",
    url: "https://app.apollo.io/#/settings/integrations/api",
    purpose:
      "Buying-role search and selected contact checks. Contact details do not grant marketing permission.",
  },
} as const;

function Channels({ data }: { data: GrowthDashboard }) {
  return (
    <>
      <section aria-labelledby="providers-title">
        <h2 id="providers-title">Research providers</h2>
        <p className="admin-muted">
          Add keys in the Convex dashboard → Settings → Environment Variables.
          Keys are never entered in this page. Configuration and tested access
          are separate.
        </p>
        <div className="growth-provider-grid">
          {Object.entries(providerSetup).map(([id, setup]) => {
            const provider = data.providers.find((item) => item.id === id);
            return (
              <article className="admin-order" key={id}>
                <div className="admin-order-head">
                  <h3>{setup.name}</h3>
                  <span
                    className={`admin-tag${provider?.configured ? "" : " review"}`}
                  >
                    {provider?.configured ? "Configured" : "Not configured"}
                  </span>
                </div>
                <p>{setup.purpose}</p>
                <p>
                  <code>{setup.key}</code>
                </p>
                <SourceLink url={setup.url}>
                  Open {setup.name} key settings
                </SourceLink>
                <p className="admin-muted">
                  Access:{" "}
                  {provider?.testedAt
                    ? `${provider.ok ? "test passed" : "not verified"} · ${when(provider.testedAt)} IST`
                    : "not tested"}
                </p>
                {provider?.message && (
                  <p className={provider.ok ? "growth-note" : "admin-error"}>
                    {provider.message}
                  </p>
                )}
                <ActionForm
                  operation="testProvider"
                  label="Test access"
                  disabled={!provider?.configured}
                >
                  <input name="id" type="hidden" value={id} />
                </ActionForm>
              </article>
            );
          })}
        </div>
        <details className="admin-order growth-setup">
          <summary className="admin-order-head">
            <strong>Research limits and Codex setup</strong>
          </summary>
          <dl className="growth-setup-list">
            <dt>
              <code>GROWTH_RESEARCH_ENABLED</code>
            </dt>
            <dd>
              Set to <code>true</code> in Convex after you approve paid
              research. Current state: {data.enabled ? "enabled" : "disabled"}.
            </dd>
            <dt>
              <code>GROWTH_MONTHLY_BUDGET_USD</code>
            </dt>
            <dd>
              Set the research limit in Convex. Current limit:{" "}
              {usdLabel(data.usage.budgetMicros)} a month.
            </dd>
            <dt>
              <code>GROWTH_APOLLO_MONTHLY_CREDITS</code>
            </dt>
            <dd>
              Set in Convex after you confirm Apollo costs. The default is zero.
              Each selected contact check also requires confirmation. Used or
              reserved this month: {data.usage.apolloUsed} of{" "}
              {data.usage.apolloLimit} allowed.
            </dd>
            <dt>
              <code>GROWTH_MCP_TOKEN</code>
            </dt>
            <dd>
              Use a dedicated token in Vercel and Convex for the protected{" "}
              <code>/api/growth/mcp</code> endpoint. Current state:{" "}
              {data.mcpConfigured
                ? "Convex configured; Vercel and client access still need a test"
                : "not configured"}
              . Keep the admin session and shared admin secret out of client
              settings.
            </dd>
          </dl>
          <p className="admin-muted">
            Codex access uses the same saved records and limits. It does not
            give permission to send messages or submit bids.
          </p>
        </details>
      </section>
      <section aria-labelledby="channels-title">
        <h2 id="channels-title">Channel readiness</h2>
        <p className="admin-muted">
          These are owner notes and official portal links. Marking ready does
          not connect an account, test an API, or prove admission.
        </p>
        <ul className="growth-channel-list">
          {channels.map((channel) => {
            const saved = data.channels.find((item) => item.id === channel.id);
            return (
              <li key={channel.id}>
                <details className="admin-order">
                  <summary className="admin-order-head">
                    <h3>{channel.name}</h3>
                    <span className="admin-tag created">
                      {statusLabel(saved?.status || "not-started")}
                    </span>
                  </summary>
                  <p className="admin-muted">{channel.purpose}</p>
                  <p>{channel.setup}</p>
                  {channel.id === "google-merchant" && (
                    <div className="growth-note">
                      <p>
                        The product feed is off by default. Review live
                        checkout, prices, delivery, returns and image rights
                        before use. In Convex, set{" "}
                        <code>GROWTH_MERCHANT_FEED_ENABLED=true</code> after
                        those checks pass. The feed also requires the live
                        checkout checks to pass.
                      </p>
                      <Link
                        className="admin-link"
                        href="/feeds/google.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open the product feed
                        <span className="growth-sr-only">
                          {" "}
                          (opens a new tab)
                        </span>
                      </Link>
                    </div>
                  )}
                  {(channel.id === "ga4" || channel.id === "posthog") && (
                    <p className="growth-note">
                      This page tracks setup only. It does not collect events or
                      prove that {channel.name} receives site data.
                    </p>
                  )}
                  <p>
                    <SourceLink url={channel.url}>
                      Open official portal
                    </SourceLink>
                  </p>
                  <ActionForm operation="saveChannel" label="Save readiness">
                    <input name="id" type="hidden" value={channel.id} />
                    <label>
                      Owner review status
                      <select
                        name="status"
                        defaultValue={saved?.status || "not-started"}
                      >
                        {channelStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Account, checks and remaining work
                      <textarea
                        name="notes"
                        maxLength={1500}
                        rows={3}
                        defaultValue={saved?.notes || ""}
                        placeholder="Record confirmed account access and evidence. Do not enter passwords or keys."
                      />
                    </label>
                  </ActionForm>
                  {saved && (
                    <p className="admin-muted">
                      Notes updated {when(saved.updatedAt)} IST
                    </p>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Drafts({ data }: { data: GrowthDashboard }) {
  const opportunities = data.opportunities.map(({ _id, name }) => ({
    _id,
    name,
  }));
  return (
    <>
      <section aria-labelledby="drafts-title">
        <h2 id="drafts-title">Drafts & results</h2>
        <p className="admin-muted">
          Prepare an introduction, sample offer or buyer questions. Nothing is
          sent from this workspace.
        </p>
        <dl className="growth-budget">
          <div>
            <dt>Saved drafts</dt>
            <dd>{data.drafts.length}</dd>
          </div>
          <div>
            <dt>Marked qualified</dt>
            <dd>
              {
                data.opportunities.filter((item) => item.status === "qualified")
                  .length
              }
            </dd>
          </div>
          <div>
            <dt>Marked contacted</dt>
            <dd>
              {
                data.opportunities.filter((item) => item.status === "contacted")
                  .length
              }
            </dd>
          </div>
          <div>
            <dt>Marked won</dt>
            <dd>
              {
                data.opportunities.filter((item) => item.status === "won")
                  .length
              }
            </dd>
          </div>
        </dl>
        <p className="admin-muted">
          These counts use owner review stages. They do not prove delivery,
          payment or revenue.
        </p>
      </section>
      <section aria-labelledby="new-draft-title">
        <details className="admin-order" open={data.drafts.length === 0}>
          <summary className="admin-order-head">
            <h2 id="new-draft-title">New draft</h2>
          </summary>
          <DraftEditor opportunities={opportunities} />
        </details>
      </section>
      <section aria-labelledby="saved-drafts-title">
        <h2 id="saved-drafts-title">Saved drafts</h2>
        {data.drafts.length === 0 ? (
          <p className="growth-empty">No saved drafts yet.</p>
        ) : (
          <ul className="admin-orders">
            {data.drafts.map((draft) => (
              <li key={draft._id}>
                <details className="admin-order">
                  <summary className="admin-order-head">
                    <h3>{draft.title}</h3>
                    <span className="admin-tag created">Draft</span>
                    <time>{when(draft.createdAt)} IST</time>
                  </summary>
                  <DraftEditor draft={draft} opportunities={opportunities} />
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
