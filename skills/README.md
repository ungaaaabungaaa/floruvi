# Project skill library

Installed on 14 September 2026 with the Codex skill installer. These are project-local copies, stored with the source backup. They can be read on the next turn through the routing table in the root [AGENTS.md](../AGENTS.md). They are not a global installation or a promise of automatic skill discovery by every editor.

## Sources and pinned revisions

| Local skill | Upstream source | Pinned commit |
| --- | --- | --- |
| react-best-practices | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices) | 063bee94c3f4df8453406c830b0a7df0f2860278 |
| web-design-guidelines | [Vercel](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines) | 063bee94c3f4df8453406c830b0a7df0f2860278 |
| seo-audit, schema, analytics, cro, copywriting, ads | [Corey Haines](https://github.com/coreyhaines31/marketingskills/tree/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills) | 5b2c0007766c6a1cf1d53fd8fc73e979e0821022 |
| convex-authz | [Official Convex skills](https://github.com/get-convex/agent-skills/tree/0aa10576821c6928f6a0f498c087af4ee231536e/skills/convex-authz) | 0aa10576821c6928f6a0f498c087af4ee231536e |
| better-auth-best-practices | [Better Auth](https://github.com/better-auth/skills/tree/20c9e88a5c007461a703f1c213572b073196113e/better-auth/best-practices) | 20c9e88a5c007461a703f1c213572b073196113e |
| better-auth-security | [Better Auth security](https://github.com/better-auth/skills/tree/20c9e88a5c007461a703f1c213572b073196113e/security) | 20c9e88a5c007461a703f1c213572b073196113e |

Names in the marketing repository have changed. This copy uses the verified current directories: `schema`, `analytics`, `cro`, and `ads`.

## Why this set

Vercel provides frontend performance and interface review guidance. The marketing skills cover search, structured data, clear copy, page/form conversion, measurement, and the later advertising phase. Convex and Better Auth provide access-control and identity guidance.

Do not load all skills on each task. Do not install every adjacent skill named in these documents. Use [the delivery plan](../docs/05-delivery-plan.md) to select the work that matters now.

## Review notes and project overrides

- The source entry points and their local Markdown links were inspected. This is a source/reference review, not a security certification of all upstream text or a runtime test.
- No downloaded executable was run. Some reference documents contain example commands. Read and adapt them before use.
- Current official Convex + Better Auth integration guidance takes precedence over generic SQL, Prisma, or Drizzle setup examples. Do not add another database or run generic schema migrations.
- Convex authorization examples must match the actual identity and data model. A clean regex scan or a passing type check is not proof of correct access control. Test denied access directly.
- The Convex authz skill names `content/convex-expert.md` in upstream prose. It is not bundled inside that skill. Resolve the relevant reference from the official Convex source before applying its helper examples. Do not create an incompatible helper to satisfy a missing reference.
- Vercel's design skill fetches a live guideline document. Record the consulted revision or date when applying it. A pinned entry point does not pin that future network response.
- Marketing integration notes under `tools/` are reference documents. The broader upstream registry mentions integrations and scripts not included here. These are not installed tools or account access.
- Ads skill language about access to ad accounts grants no access or authority. Purchases, public campaigns, and outreach need the owner's instruction.
- The owner directs the design. These skills help implement and review that direction.

## Licenses and updates

The marketing repository license is preserved under [licenses/](licenses/). Other copies retain available in-file license metadata. Source attribution and immutable revision links are above. Do not assume that every repository uses the same license; inspect upstream terms before separate redistribution of a skill package.

Keep vendor content separate from project rules. `manifest.json` records source revisions and file hashes for the installed skill directories. Updates are deliberate: review the source diff, update the selected copy, rerun reference checks, and refresh the manifest. Do not auto-update skills while implementing checkout.
