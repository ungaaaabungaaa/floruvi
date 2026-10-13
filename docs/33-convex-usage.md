# Convex use: 13 October 2026

## Evidence

The owner supplied the Floruvi-only database I/O chart for 1–13 October:
1.83 GB reads (98.9%) and 20.52 MB writes (1.1%).

A read-only sample of 1,000 recent production executions covered 13 October,
08:43–14:20 UTC. Target: `polished-mosquito-828`.

| Function | Calls | Database read bytes |
| --- | ---: | ---: |
| storefront:catalogue | 143 | 30,542,033 |
| storefront:recipes | 37 | 7,921,044 |
| storefront:product | 415 | 1,842,173 |
| storefront:recipe | 316 | 514,597 |
| chat:closeIdle | 6 | 899 |

The two public list functions account for about 93% of all read bytes in this
sample. They read whole published records, including details, before returning
summaries. Translated lists also read translation records. Each country and
language request has a separate cache key. The sample does not identify visitor
type or prove the cause of all monthly use. Development use is not measured here.
No customer text, arguments, credentials or raw logs are saved in this report.

## First change

- Keep public catalogue and recipe reads in the existing Next.js data cache for
  24 hours, increased from one hour.
- Use that cache for `/llms.txt` too. It previously made uncached Convex reads
  whenever the route executed.
- Keep admin stock cache invalidation. Stock edits in `/admin` expire the public
  catalogue tag immediately.
- Keep checkout, payment, private admin and chat reads live.

Direct edits in the Convex dashboard can take 24 hours to appear on public pages.
Time-based refresh frequency can fall by up to 24 times for a repeatedly used
cache key. This is not a measured saving or a guarantee of zero cost. Cold caches,
builds, invalidation, direct API requests and abuse can still cause reads.

## Acceptance and next step

Local validation passed: five focused cache/search tests, TypeScript, changed-file
lint and whitespace checks. The cache test checks request options and route output;
it does not prove deployed cache hits. A production build, release and post-release
usage comparison have not been performed.

The change requires a website release. It does not require a Convex deployment
or data migration. Compare full-day database I/O after release with the same
project and deployment filters. Aim below 25 MB/day to leave headroom within a
1 GB monthly allowance. Existing monthly use does not disappear after a fix.

If list reads remain high, inspect cache misses and build traffic first. Consider
separating summary fields from long details only if measurement justifies the
schema change and migration. Do not remove languages or search pages to save reads.

Official limits: https://docs.convex.dev/production/state/limits
