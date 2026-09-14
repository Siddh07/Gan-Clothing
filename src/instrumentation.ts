export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionSafety } = await import("./lib/startup-checks");
    assertProductionSafety();
  }
}
