import request from "supertest";

import { createApp } from "../../backend/src/app";
import { TestDb } from "../helpers/testDb";

jest.setTimeout(60000);

const testDb = new TestDb();
const app = createApp();

describe("Agents orchestrator (Bridger & Validator)", () => {
  beforeAll(async () => {
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  beforeEach(async () => {
    await request(app)
      .post("/api/projects")
      .send({ projectId: "demo", name: "Demo Project" })
      .expect(201);

    await request(app)
      .post("/api/projects/demo/characters")
      .send({
        characterId: "char_001",
        name: "Elias",
        coreTraits: ["Pragmatic", "Suspicious"],
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
      .post("/api/projects/demo/storyline-nodes")
      .send({
        nodeId: "story_1",
        characterId: "char_001",
        eventId: "evt_001",
        content: "Initial draft",
      })
      .expect(201);
  });

  it("calls Bridger and returns bridging_steps", async () => {
    const res = await request(app)
      .post("/api/projects/demo/bridger")
      .send({
        characterId: "char_001",
        startEventId: "evt_001",
        endEventId: "evt_001",
      })
      .expect(200);

    expect(Array.isArray(res.body.bridging_steps)).toBe(true);
    expect(res.body.bridging_steps.length).toBeGreaterThan(0);
  });

  it("calls Validator with nodeId and updates storyline node status", async () => {
    const res = await request(app)
      .post("/api/projects/demo/validator")
      .send({
        characterId: "char_001",
        nodeId: "story_1",
      })
      .expect(200);

    expect(res.body.pass).toBe(true);

    const nodesRes = await request(app)
      .get("/api/projects/demo/storyline-nodes")
      .expect(200);

    const node = nodesRes.body.find((n: { nodeId: string }) => n.nodeId === "story_1");
    expect(node.status).toBe("stable");
    expect(node.lastCheckResult).toBeDefined();
  });
});

