export function assertProductionSafety() {
  if (process.env.NODE_ENV !== "production") return;

  const required = [
    "NEXTAUTH_SECRET",
    "DATABASE_URL",
    "NEXTAUTH_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `STARTUP FAILURE: Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (
    process.env.NEXTAUTH_SECRET === "changeme" ||
    process.env.NEXTAUTH_SECRET === "secret" ||
    process.env.NEXTAUTH_SECRET === "gan_nepal_secret_key_change_in_production_2024"
  ) {
    throw new Error(
      "STARTUP FAILURE: NEXTAUTH_SECRET is using a default insecure value."
    );
  }
}
