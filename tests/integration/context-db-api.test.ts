import request from "supertest";

import { createApp } from "../../backend/src/app";
import { TestStorage } from "../helpers/testStorage";
import * as store from "../../backend/src/storage/jsonStore";

const testStorage = new TestStorage();
const app = createApp();

describe("Context DB CRUD integration", () => {
  beforeAll(async () => {
    await testStorage.setup();
  });

  afterEach(async () => {
    await testStorage.cleanup();
  });

  afterAll(async () => {
    await testStorage.teardown();
  });

  it("creates a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ projectId: "demo", name: "Demo Project" })
      .expect(201);

    expect(res.body.projectId).toBe("demo");
    expect(res.body.name).toBe("Demo Project");

    const projects = await store.listProjects();
    expect(projects.some((p) => p.projectId === "demo")).toBe(true);
  });

  it("performs Character / WorldRule / Event CRUD", async () => {
    await request(app)
      .post("/api/projects")
      .send({ projectId: "demo", name: "Demo Project" })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/characters")
      .send({
        characterId: "char_001",
        name: "Elias",
        coreTraits: ["Pragmatic"],
        flaws: [],
        motivations: [],
        relationships: [],
      })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/world-rules")
      .send({
        ruleId: "rule_001",
        category: "Physics_Magic",
        description: "Using neural-implants drains physical stamina exponentially.",
        strictnessLevel: "High",
      })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/events")
      .send({
        eventId: "evt_001",
        timelineOrder: 10,
        title: "The Server Room Breach",
        objectiveFacts: "The main server was destroyed at 02:00 AM by an unknown explosive.",
        involvedCharacterIds: ["char_001"],
      })
      .expect(201);

    await request(app)
      .put("/api/projects/demo/characters/char_001")
      .send({ coreTraits: ["Pragmatic", "Suspicious"] })
      .expect(200);

    await request(app).delete("/api/projects/demo/events/evt_001").expect(204);

    const events = await store.findEvents("demo");
    expect(events.length).toBe(0);
  });

  it("supports basic StorylineNode CRUD and status filtering", async () => {
    await request(app)
      .post("/api/projects")
      .send({ projectId: "demo", name: "Demo Project" })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/storyline-nodes")
      .send({
        nodeId: "story_1",
        characterId: "char_001",
        eventId: "evt_001",
        content: "Initial draft",
      })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/storyline-nodes")
      .send({
        nodeId: "story_2",
        characterId: "char_002",
        eventId: "evt_002",
        content: "Another draft",
        status: "needs_revision",
      })
      .expect(201);

    const allRes = await request(app)
      .get("/api/projects/demo/storyline-nodes")
      .expect(200);
    expect(allRes.body.length).toBe(2);

    const needsRevisionRes = await request(app)
      .get("/api/projects/demo/storyline-nodes")
      .query({ status: "needs_revision" })
      .expect(200);
    expect(needsRevisionRes.body.length).toBe(1);
    expect(needsRevisionRes.body[0].nodeId).toBe("story_2");
  });
});
