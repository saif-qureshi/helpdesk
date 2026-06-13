/**
 * Pure parser: given the text of a Prisma schema, returns the names of models
 * that declare an `organisationId` field (i.e. are tenant-scoped). Kept
 * dependency-free and side-effect-free so it's trivially testable; the codegen
 * script (scripts/gen-tenant-models.ts) does the file IO.
 */
export function parseTenantScopedModels(schema: string): string[] {
  const models: string[] = [];
  // Model bodies never contain `}`, so a non-greedy `[^}]*` is safe here.
  const modelRe = /model\s+(\w+)\s*\{([^}]*)\}/g;

  for (let match = modelRe.exec(schema); match; match = modelRe.exec(schema)) {
    const name = match[1];
    const body = match[2];
    if (!name || body === undefined) continue;
    // Match an `organisationId` field declaration at the start of a line.
    if (/(^|\n)\s*organisationId\s+/.test(body)) {
      models.push(name);
    }
  }

  return models.sort();
}
