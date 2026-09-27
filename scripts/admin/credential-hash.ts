// Creates ADMIN_CREDENTIAL_HASH for the owner sign-in.
// Usage: pnpm admin:hash            (asks for each detail; secrets are not shown)
//        pnpm admin:hash < file.json  ({"email","aadhaar","dob","phone","password"})
// Then: pnpm exec convex env set ADMIN_CREDENTIAL_HASH '<printed value>'  (add --prod for production)
import { createInterface } from "node:readline";
import { adminLoginSchema, hashAdminCredentials } from "../../lib/admin-credentials";

async function ask(question: string, hidden = false) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) =>
      write.call(rl, s.startsWith(question) ? s : "*".repeat(s.length ? 1 : 0));
  }
  const answer = await new Promise<string>((resolve) => rl.question(question, resolve));
  rl.close();
  if (hidden) process.stdout.write("\n");
  return answer;
}

async function readInput() {
  if (!process.stdin.isTTY) {
    let text = "";
    for await (const chunk of process.stdin) text += chunk;
    return JSON.parse(text);
  }
  return {
    email: await ask("Email: "),
    password: await ask("Password: ", true),
    aadhaar: await ask("Aadhaar number (12 digits): ", true),
    dob: await ask("Date of birth (YYYY-MM-DD): "),
    phone: await ask("Mobile number (10 digits): "),
  };
}

async function main() {
  const login = adminLoginSchema.safeParse(await readInput());
  if (!login.success) {
    console.error("Check the details: email, 12-digit Aadhaar, YYYY-MM-DD date of birth, 10-digit mobile, password.");
    process.exit(1);
  }
  if (login.data.password.length < 12)
    console.error("Warning: use a password of at least 12 characters for the live site.");
  console.log(await hashAdminCredentials(login.data));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
