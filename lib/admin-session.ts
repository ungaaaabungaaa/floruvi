// Owner admin session lengths. Pure, so the rules are unit tested (tests/admin.test.ts).

const HOUR = 60 * 60 * 1000;
export const SESSION_HOURS = { remembered: 14 * 24, browser: 12 };
// Use keeps a session alive, but never past this many days after sign-in.
export const SESSION_MAX_DAYS = 90;

/**
 * The new end of a live session that is in use: a full period from now, capped at
 * SESSION_MAX_DAYS after sign-in. Null when it would move less than an hour, so a
 * session is written at most once an hour.
 */
export function renewedSession(
  session: { createdAt: number; expiresAt: number; remembered?: boolean },
  now: number,
) {
  if (session.expiresAt <= now) return null;
  // Older sessions have no flag; until renewed, their length still shows which kind they are.
  const remembered =
    session.remembered ?? session.expiresAt - session.createdAt > SESSION_HOURS.browser * HOUR;
  const hours = remembered ? SESSION_HOURS.remembered : SESSION_HOURS.browser;
  const expiresAt = Math.min(now + hours * HOUR, session.createdAt + SESSION_MAX_DAYS * 24 * HOUR);
  if (expiresAt - session.expiresAt < HOUR) return null;
  return { remembered, expiresAt, maxAgeSeconds: Math.floor((expiresAt - now) / 1000) };
}
