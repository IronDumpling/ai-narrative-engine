/**
 * Storage schema validation (JSON store).
 * Replaces former Mongoose model tests.
 */
import { TestStorage } from "../helpers/testStorage";
import * as store from "../../backend/src/storage/jsonStore";

const testStorage = new TestStorage();

describe("JSON storage schemas", () => {
  beforeAll(async () => {
    await testStorage.setup();
  });

  afterEach(async () => {
    await testStorage.cleanup();
  });

  afterAll(async () => {
    await testStorage.teardown();
  });

  it("enforces unique projectId on create", async () => {
    await store.createProject({ projectId: "demo", name: "Demo Project" });
    await expect(store.createProject({ projectId: "demo", name: "Duplicate" })).rejects.toThrow(
      /already exists/
    );
  });

  it("creates project with required fields", async () => {
    const created = await store.createProject({
      projectId: "demo",
      name: "Demo Project",
    });
    expect(created.projectId).toBe("demo");
    expect(created.name).toBe("Demo Project");
  });

  it("StorylineNode defaults status to draft", async () => {
    await store.createProject({ projectId: "demo", name: "Demo" });
    await store.createCharacter("demo", {
      characterId: "c1",
      name: "E",
      coreTraits: [],
      flaws: [],
      motivations: [],
      relationships: [],
    });
    await store.createEvent("demo", {
      eventId: "e1",
      timelineOrder: 1,
      title: "E",
      objectiveFacts: "F",
      involvedCharacterIds: [],
    });

    const node = await store.createStorylineNode("demo", {
      nodeId: "n1",
      characterId: "c1",
      eventId: "e1",
      content: "Some content",
    });
    expect(node.status).toBe("draft");
  });
});
