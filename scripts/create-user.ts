import * as dotenv from "dotenv";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import { profiles } from "../lib/db/schema/users";

// Load environment variables (.env.local prioritized)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

neonConfig.webSocketConstructor = ws;

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  let positionalIndex = 0;
  const positionalKeys = ["name", "email", "password", "role"];

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      result[key] = rest.join("=");
    } else {
      if (positionalIndex < positionalKeys.length) {
        result[positionalKeys[positionalIndex]] = arg;
        positionalIndex++;
      }
    }
  }

  return result;
}

async function main() {
  console.log("==================================================");
  console.log("       Bhoomi Setu — User Creation Script         ");
  console.log("==================================================\n");

  const parsed = parseArgs();
  let name = parsed.name;
  let email = parsed.email;
  let password = parsed.password;
  let role = (parsed.role?.toLowerCase() as "admin" | "reviewer") || "admin";

  // Prompt interactively if missing arguments
  if (!name || !email || !password) {
    const rl = readline.createInterface({ input, output });

    try {
      if (!name) {
        name = await rl.question("Enter User Full Name: ");
      }
      if (!email) {
        email = await rl.question("Enter User Email: ");
      }
      if (!password) {
        password = await rl.question("Enter User Password (min 8 chars): ");
      }
      if (!parsed.role) {
        const roleInput = await rl.question("Enter Role (admin/reviewer) [default: admin]: ");
        if (roleInput.trim().toLowerCase() === "reviewer") {
          role = "reviewer";
        } else {
          role = "admin";
        }
      }
    } finally {
      rl.close();
    }
  }

  // Sanitize and validate inputs
  name = name?.trim();
  email = email?.trim()?.toLowerCase();
  password = password?.trim();

  if (!name) {
    console.error("Error: Full Name cannot be empty.");
    process.exit(1);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Error: A valid email address is required.");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("Error: Password must be at least 8 characters long.");
    process.exit(1);
  }
  if (role !== "admin" && role !== "reviewer") {
    role = "admin";
  }

  const neonAuthBaseUrl = process.env.NEON_AUTH_BASE_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL;
  if (!neonAuthBaseUrl) {
    console.error("Error: Missing NEON_AUTH_BASE_URL in environment (.env.local).");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: Missing DATABASE_URL in environment (.env.local).");
    process.exit(1);
  }

  console.log(`\nCreating user:`);
  console.log(`  Name:     ${name}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Role:     ${role}`);
  console.log(`  Endpoint: ${neonAuthBaseUrl}`);
  console.log("\n[1/2] Creating Auth User in Neon Auth...");

  let authUserId: string;

  try {
    // 1. Call Neon Auth / Better Auth sign-up endpoint
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signUpUrl = `${neonAuthBaseUrl.replace(/\/+$/, "")}/sign-up/email`;
    const res = await fetch(signUpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin,
        "Referer": `${origin}/`,
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      const errorMsg = data?.message || data?.error || res.statusText || "Sign up request failed";

      // If user already exists in Neon Auth, attempt sign-in to retrieve ID
      if (errorMsg.toLowerCase().includes("already exists") || res.status === 422 || res.status === 409) {
        console.log("User already registered in Neon Auth. Attempting credential verification...");
        const signInUrl = `${neonAuthBaseUrl.replace(/\/+$/, "")}/sign-in/email`;
        const signInRes = await fetch(signInUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Origin": origin,
            "Referer": `${origin}/`,
          },
          body: JSON.stringify({ email, password }),
        });
        const signInData = await signInRes.json().catch(() => null);
        const existingUser = signInData?.user || signInData;
        if (signInRes.ok && existingUser?.id) {
          authUserId = existingUser.id;
          console.log(`✓ Verified existing user ID: ${authUserId}`);
        } else {
          console.error(`Auth registration failed: ${errorMsg}`);
          process.exit(1);
        }
      } else {
        console.error(`Auth creation failed (${res.status}): ${errorMsg}`);
        process.exit(1);
      }
    } else {
      const user = data.user || data;
      if (!user?.id) {
        console.error("Unexpected response from Neon Auth:", JSON.stringify(data, null, 2));
        process.exit(1);
      }

      authUserId = user.id;
      console.log(`✓ Neon Auth user created with ID: ${authUserId}`);
    }
  } catch (err) {
    console.error("Failed to connect to Neon Auth service:", err);
    process.exit(1);
  }

  // 2. Insert/Upsert into profiles table
  console.log("\n[2/2] Registering Profile in Database...");
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const db = drizzle(pool, { schema });

  try {
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.authUserId, authUserId))
      .limit(1);

    if (existingProfile) {
      // Update existing profile role/name if necessary
      const [updated] = await db
        .update(profiles)
        .set({
          displayName: name,
          role,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(profiles.id, existingProfile.id))
        .returning();

      console.log(`✓ Profile updated successfully (Profile ID: ${updated.id})`);
    } else {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          authUserId,
          displayName: name,
          role,
          isActive: true,
        })
        .returning();

      console.log(`✓ Profile created successfully (Profile ID: ${newProfile.id})`);
    }

    console.log("\n==================================================");
    console.log("User successfully created & ready to log in!");
    console.log(`Email:    ${email}`);
    console.log(`Role:     ${role}`);
    console.log(`Auth ID:  ${authUserId}`);
    console.log("==================================================\n");
  } catch (err) {
    console.error("Database operation failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
