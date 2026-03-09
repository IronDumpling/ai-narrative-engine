/**
 * Versioning service tests: SKIPPED in Route B (local JSON storage, no version management).
 * Version management is reserved for future implementation.
 */
describe("versioningService (future)", () => {
  it.skip("increments project dbVersion and writes DbChangeLog", () => {});
  it.skip("marks only matching character storyline nodes as needs_revision", () => {});
  it.skip("marks nodes by event when entityType is Event", () => {});
  it.skip("marks all nodes in project when entityType is WorldRule", () => {});
});
