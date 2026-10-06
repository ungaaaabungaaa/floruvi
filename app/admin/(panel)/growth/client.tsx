"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useState,
  useTransition,
  type ReactNode,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  buyerGroups,
  type GrowthDraft,
  type Opportunity,
  type SupplyProfile,
} from "@/lib/growth";
import {
  growthAction,
  type GrowthFormState,
  type GrowthOperation,
} from "./actions";

// Dispatch explicitly so React does not clear a long form after a handled error.
function preserveFields(
  event: FormEvent<HTMLFormElement>,
  action: (form: FormData) => void,
) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  startTransition(() => action(form));
}

export function ActionForm({
  operation,
  children,
  label,
  disabled = false,
}: {
  operation: GrowthOperation;
  children: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(
    growthAction.bind(null, operation),
    null,
  );
  return (
    <form
      action={action}
      onSubmit={(event) => preserveFields(event, action)}
      className="admin-form growth-form"
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="growth-fields">
        {children}
      </fieldset>
      <div className="growth-actions">
        <button className="admin-button" disabled={disabled || pending}>
          {pending ? "Please wait…" : label}
        </button>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function ActionMessage({ state }: { state: GrowthFormState }) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {state && (
        <p
          className={state.ok ? "growth-success" : "admin-error"}
          role={state.ok ? "status" : "alert"}
        >
          {state.error || state.message}
        </p>
      )}
    </div>
  );
}

export function ResearchRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      const focused = document.activeElement;
      const editing =
        focused instanceof HTMLElement &&
        (focused.matches("input, textarea, select") ||
          focused.isContentEditable);
      if (document.visibilityState === "visible" && !editing && !pending)
        startTransition(() => router.refresh());
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [active, pending, router]);
  return (
    <div className="growth-actions">
      <button
        type="button"
        className="admin-button ghost"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        {pending ? "Refreshing…" : "Refresh status"}
      </button>
      {active && <span className="admin-muted">Updates automatically.</span>}
    </div>
  );
}

export function ResearchForm({
  profile,
  enabled,
  hasOpenAI,
  hasExa,
  active,
}: {
  profile: SupplyProfile;
  enabled: boolean;
  hasOpenAI: boolean;
  hasExa: boolean;
  active: boolean;
}) {
  const [groups, setGroups] = useState<string[]>(
    buyerGroups.map((group) => group.id),
  );
  const canRun = enabled && hasOpenAI && !active && groups.length > 0;
  return (
    <ActionForm
      operation="startResearch"
      label="Start research"
      disabled={!canRun}
    >
      <div className="growth-form-grid">
        <label>
          What to find
          <select name="kind" defaultValue="buyers">
            <option value="buyers">Buyers</option>
            <option value="tenders">Official tenders</option>
            <option value="export">Export research</option>
          </select>
        </label>
        <label>
          City, state or country
          <input
            name="region"
            defaultValue={profile.origin}
            minLength={2}
            maxLength={160}
            required
            placeholder="For example, Karnataka, India"
          />
        </label>
        <label>
          Products
          <input
            name="products"
            defaultValue={profile.products.slice(0, 500)}
            minLength={2}
            maxLength={500}
            required
            placeholder="For example, basil and leafy vegetables"
          />
        </label>
      </div>
      <details className="growth-review growth-research-options">
        <summary>
          Search options ·{" "}
          {groups.length === buyerGroups.length
            ? "All buyer groups"
            : `${groups.length} buyer groups`}
        </summary>
        <div className="growth-fields">
          <label>
            Maximum results
            <input
              name="limit"
              type="number"
              defaultValue={10}
              min={1}
              max={20}
              required
            />
          </label>
          <fieldset className="growth-group-field">
            <legend>Buyer groups</legend>
            <div className="growth-actions">
              <button
                type="button"
                className="admin-button ghost"
                onClick={() => setGroups(buyerGroups.map((group) => group.id))}
              >
                Select all
              </button>
              <button
                type="button"
                className="admin-button ghost"
                onClick={() => setGroups([])}
              >
                Clear all
              </button>
              <span>
                {groups.length} of {buyerGroups.length} selected
              </span>
            </div>
            <div className="growth-group-checks">
              {buyerGroups.map((group) => (
                <label key={group.id} className="admin-check">
                  <input
                    type="checkbox"
                    name="groups"
                    value={group.id}
                    checked={groups.includes(group.id)}
                    onChange={(event) =>
                      setGroups((current) =>
                        event.target.checked
                          ? [...current, group.id]
                          : current.filter((id) => id !== group.id),
                      )
                    }
                  />
                  {group.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="admin-check">
            <input type="checkbox" name="useExa" disabled={!hasExa} />
            Use Exa for added source search{!hasExa && " (key not configured)"}
          </label>
        </div>
      </details>
      <p className="admin-muted">
        Paid search · Up to 10 results by default. Check sources before
        contacting a buyer.
      </p>
      {!canRun && (
        <p className="growth-note">
          {active
            ? "A research run is already active. Wait for it to finish or cancel it."
            : !enabled
              ? "Research is paused. Check research setup in Channels."
              : !hasOpenAI
                ? "Connect OpenAI in Channels to start research."
                : "Choose at least one buyer group in Search options."}
        </p>
      )}
    </ActionForm>
  );
}

export function OpportunityForm({
  initial,
}: {
  initial?: Partial<Opportunity>;
}) {
  const [kind, setKind] = useState(initial?.kind || "buyer");
  return (
    <ActionForm operation="saveOpportunity" label="Save opportunity">
      <div className="growth-form-grid">
        <label>
          Record type
          <select
            name="kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as Opportunity["kind"])
            }
          >
            <option value="buyer">Buyer</option>
            <option value="tender">Tender</option>
            <option value="export">Export buyer or route</option>
          </select>
        </label>
        <label>
          Buyer group
          <select name="group" defaultValue={initial?.group || "hospitality"}>
            {buyerGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {kind === "tender"
            ? "Tender title or issuer"
            : "Business or organisation"}
          <input
            name="name"
            minLength={2}
            maxLength={180}
            required
            defaultValue={initial?.name}
          />
        </label>
        <label>
          Location
          <input
            name="location"
            maxLength={180}
            defaultValue={initial?.location}
          />
        </label>
        <label>
          Business website
          <input
            name="website"
            type="url"
            maxLength={1500}
            placeholder="https://"
            defaultValue={initial?.website}
          />
        </label>
        <label>
          Buying role or contractor
          <input name="role" maxLength={180} defaultValue={initial?.role} />
        </label>
        <label>
          Public business contact
          <input
            name="contact"
            maxLength={250}
            defaultValue={initial?.contact}
          />
        </label>
        <label>
          Source title
          <input
            name="sourceTitle"
            maxLength={200}
            required
            defaultValue={initial?.sourceTitle}
          />
        </label>
        <label className="growth-full">
          {kind === "tender" ? "Official notice link" : "Source link"}
          <input
            name="sourceUrl"
            type="url"
            maxLength={1500}
            required
            placeholder="https://"
            defaultValue={initial?.sourceUrl}
          />
        </label>
      </div>
      <label>
        Evidence and buyer relationship
        <textarea
          name="summary"
          maxLength={2000}
          rows={3}
          defaultValue={initial?.summary}
          placeholder="Who buys the produce? Record the institution and its caterer when known."
        />
      </label>
      <label>
        Product and delivery fit
        <textarea
          name="productFit"
          maxLength={1000}
          rows={2}
          defaultValue={initial?.productFit}
        />
      </label>
      {kind === "tender" ? (
        <fieldset className="growth-group-field">
          <legend>Tender details</legend>
          <div className="growth-form-grid">
            <label>
              Official tender reference
              <input name="tenderReference" maxLength={180} required />
            </label>
            <label>
              Closing date and time zone
              <input
                name="deadline"
                maxLength={100}
                placeholder="Copy the date and time zone from the notice"
              />
            </label>
            <label className="growth-full">
              Eligibility, deposits and delivery terms
              <textarea
                name="requirements"
                maxLength={2000}
                rows={4}
                placeholder="Record amendments, quantity, fees, payment terms and missing evidence. Recheck the official notice before bidding."
              />
            </label>
          </div>
        </fieldset>
      ) : (
        <>
          <input name="tenderReference" type="hidden" value="" />
          <input name="deadline" type="hidden" value="" />
          <input name="requirements" type="hidden" value="" />
        </>
      )}
      <label>
        Next step
        <textarea
          name="nextStep"
          maxLength={1000}
          rows={2}
          defaultValue={initial?.nextStep}
        />
      </label>
      <p className="admin-muted">
        New records start as found. A source or contact does not prove demand or
        consent to marketing.
      </p>
    </ActionForm>
  );
}

export function DraftEditor({
  draft,
  opportunities,
}: {
  draft?: GrowthDraft;
  opportunities: Pick<Opportunity, "_id" | "name">[];
}) {
  const [title, setTitle] = useState(draft?.title || "");
  const [body, setBody] = useState(draft?.body || "");
  const [draftId, setDraftId] = useState(draft?._id);
  const [copyState, setCopyState] = useState("");
  const [state, action, pending] = useActionState(
    async (previous: GrowthFormState, form: FormData) => {
      const result = await growthAction("saveDraft", previous, form);
      if (result?.ok) {
        if (draft && result.id) setDraftId(result.id);
        if (!draft) {
          setTitle("");
          setBody("");
          setCopyState("");
        }
      }
      return result;
    },
    null,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    growthAction.bind(null, "deleteDraft"),
    null,
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${body}`);
      setCopyState("Draft copied.");
    } catch {
      setCopyState("Copy did not work. Select the draft text and copy it.");
    }
  }
  function download() {
    const blob = new Blob([`${title}\n\n${body}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9-]/gi, "-").slice(0, 80) || "floruvi-draft"}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="growth-draft">
      <form
        action={action}
        onSubmit={(event) => preserveFields(event, action)}
        className="admin-form growth-form"
        aria-busy={pending}
      >
        {draftId && <input name="id" type="hidden" value={draftId} />}
        <fieldset className="growth-fields" disabled={pending || deleting}>
          <label>
            Title
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={2}
              maxLength={180}
              required
            />
          </label>
          <label>
            Related opportunity
            <select
              name="opportunityId"
              defaultValue={draft?.opportunityId || ""}
            >
              <option value="">No linked opportunity</option>
              {opportunities.map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Draft text
            <textarea
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              minLength={5}
              maxLength={6000}
              required
              rows={8}
            />
          </label>
        </fieldset>
        <div className="growth-actions">
          <button className="admin-button" disabled={pending || deleting}>
            {pending ? "Saving…" : draftId ? "Save changes" : "Save draft"}
          </button>
          <button
            type="button"
            className="admin-button ghost"
            disabled={!body}
            onClick={copy}
          >
            Copy text
          </button>
          <button
            type="button"
            className="admin-button ghost"
            disabled={!body}
            onClick={download}
          >
            Download text
          </button>
        </div>
        <ActionMessage state={state} />
        <p role="status" className="growth-copy-status">
          {copyState}
        </p>
      </form>
      {draft && (
        <form
          action={deleteAction}
          className="growth-delete"
          onSubmit={(event) => {
            if (!window.confirm(`Delete “${draft.title}”?`))
              event.preventDefault();
          }}
        >
          <input name="id" type="hidden" value={draft._id} />
          <button className="admin-button ghost" disabled={deleting || pending}>
            {deleting ? "Deleting…" : "Delete draft"}
          </button>
          <ActionMessage state={deleteState} />
        </form>
      )}
    </div>
  );
}

type ApolloPerson = {
  id: string;
  name: string;
  title: string;
  organization: string;
  domain?: string;
  linkedinUrl?: string;
  email?: string;
  emailStatus?: string;
};
function apolloPeople(value: unknown): ApolloPerson[] {
  if (!value || typeof value !== "object") return [];
  const data = value as Record<string, unknown>;
  const items = Array.isArray(data.people)
    ? data.people
    : Array.isArray(data.contacts)
      ? data.contacts
      : Array.isArray(value)
        ? value
        : [];
  return items.filter(
    (item): item is ApolloPerson =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.name === "string",
  );
}

function ApolloContact({
  person,
  sourceUrl,
  creditsAvailable,
}: {
  person: ApolloPerson;
  sourceUrl: string;
  creditsAvailable: boolean;
}) {
  const [state, action, pending] = useActionState(
    growthAction.bind(null, "apolloEnrich"),
    null,
  );
  const [showSave, setShowSave] = useState(false);
  const contact =
    state?.ok && state.data && typeof state.data === "object"
      ? (state.data as Record<string, unknown>)
      : null;
  const result =
    contact && typeof contact.person === "object" && contact.person
      ? (contact.person as Record<string, unknown>)
      : contact;
  const email = result && typeof result.email === "string" ? result.email : "";
  const checked = Boolean(state?.ok);
  return (
    <li className="admin-order">
      <h3>{person.name}</h3>
      <p>
        {person.title || "Role not supplied"} ·{" "}
        {person.organization || "Company not supplied"}
      </p>
      <form
        action={action}
        onSubmit={(event) => preserveFields(event, action)}
        className="admin-form growth-form"
        aria-busy={pending}
      >
        <input type="hidden" name="personId" value={person.id} />
        <label className="admin-check">
          <input
            type="checkbox"
            name="confirm"
            required
            disabled={pending || checked || !creditsAvailable}
          />
          I checked the company match. Use Apollo credits for this contact.
        </label>
        <button
          className="admin-button ghost"
          disabled={pending || checked || !creditsAvailable}
        >
          {pending
            ? "Checking…"
            : checked
              ? "Contact checked"
              : "Check selected contact"}
        </button>
        <ActionMessage state={state} />
      </form>
      {result && (
        <div className="growth-note">
          <strong>Contact result</strong>
          <p>
            {typeof contact?.status === "string"
              ? contact.status.replaceAll("-", " ")
              : "Review required"}
          </p>
          <p>{email || "No business email returned."}</p>
          <p>
            Contact details do not show consent to marketing. Verify the role
            and source before use.
          </p>
        </div>
      )}
      <button
        type="button"
        className="admin-button ghost"
        onClick={() => setShowSave((shown) => !shown)}
        aria-expanded={showSave}
      >
        {showSave ? "Close record form" : "Review and save opportunity"}
      </button>
      {showSave && (
        <OpportunityForm
          initial={{
            name: person.organization || "",
            role: person.title,
            contact: email || person.name,
            website: person.domain ? `https://${person.domain}` : "",
            sourceUrl,
            sourceTitle: "Apollo contact research",
            summary: `Apollo candidate: ${person.name} (reference ${person.id}). Check the organisation and buying role before use.`,
          }}
        />
      )}
    </li>
  );
}

export function ApolloSearch({
  configured,
  creditsAvailable,
}: {
  configured: boolean;
  creditsAvailable: boolean;
}) {
  const [state, action, pending] = useActionState(
    growthAction.bind(null, "apolloSearch"),
    null,
  );
  const people = apolloPeople(state?.data);
  const resultData =
    state?.data && typeof state.data === "object"
      ? (state.data as Record<string, unknown>)
      : null;
  const sourceUrl =
    typeof resultData?.sourceUrl === "string" ? resultData.sourceUrl : "";
  const resultId = useId();
  return (
    <div>
      <p className="admin-muted">
        Search for buying roles at a known business. Results stay here until you
        choose and save an opportunity. Search does not reveal an email or
        phone.
      </p>
      <form
        action={action}
        onSubmit={(event) => preserveFields(event, action)}
        className="admin-form growth-form"
        aria-busy={pending}
        aria-describedby={resultId}
      >
        <div className="growth-form-grid">
          <label>
            Organisation
            <input name="organization" minLength={2} maxLength={180} required />
          </label>
          <label>
            Current company domain
            <input
              name="domain"
              minLength={3}
              maxLength={200}
              required
              placeholder="example.com"
            />
          </label>
        </div>
        <button className="admin-button" disabled={!configured || pending}>
          {pending ? "Searching…" : "Search buying roles"}
        </button>
        <ActionMessage state={state} />
      </form>
      <div id={resultId} aria-live="polite">
        {!configured && (
          <p className="growth-note">
            Add APOLLO_API_KEY in Convex, then test access.
          </p>
        )}
        {state?.ok && <p>{people.length} contact candidates returned.</p>}
        {!creditsAvailable && (
          <p className="growth-note">
            Contact checks are disabled until the Apollo credit allowance can
            cover a selected contact.
          </p>
        )}
      </div>
      {people.length > 0 && (
        <ul className="admin-orders">
          {people.map((person) => (
            <ApolloContact
              key={person.id}
              person={person}
              sourceUrl={sourceUrl}
              creditsAvailable={creditsAvailable}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
