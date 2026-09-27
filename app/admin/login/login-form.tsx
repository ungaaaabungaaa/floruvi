"use client";
import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);
  return (
    <form action={action} className="admin-form">
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required maxLength={200} />
      </label>
      <label>
        Aadhaar number
        <input
          name="aadhaar"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          pattern="\d{4}\s?\d{4}\s?\d{4}"
          maxLength={14}
          placeholder="12 digits"
        />
      </label>
      <label>
        Date of birth
        <input name="dob" type="date" autoComplete="bday" required min="1900-01-01" max={today} />
      </label>
      <label>
        Mobile number
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          pattern="(\+?91[\s-]?)?\d{5}[\s-]?\d{5}"
          maxLength={16}
          placeholder="10 digits"
        />
      </label>
      <label className="admin-check">
        <input name="remember" type="checkbox" defaultChecked />
        Keep me signed in for 14 days
      </label>
      {state?.error && (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="admin-button" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
