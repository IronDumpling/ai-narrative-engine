import request from "supertest";

import { createApp } from "../../backend/src/app";
import { TestDb } from "../helpers/testDb";
import { ProjectModel } from "../../backend/src/models/project.model";
import { DbChangeLogModel } from "../../backend/src/models/dbChangeLog.model";

jest.setTimeout(60000);

const testDb = new TestDb();
const app = createApp();

describe("Versioning flow integration", () => {
  beforeAll(async () => {
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  it("marks storyline nodes as needs_revision when related context changes", async () => {
    // 1. Create Project
    await request(app)
      .post("/api/projects")
      .send({ projectId: "demo", name: "Demo Project" })
      .expect(201);

    // 2. Create Character and Event
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
      .post("/api/projects/demo/events")
      .send({
        eventId: "evt_001",
        timelineOrder: 10,
        title: "The Server Room Breach",
        objectiveFacts: "The main server was destroyed at 02:00 AM by an unknown explosive.",
        involvedCharacterIds: ["char_001"],
      })
      .expect(201);

    let project = await ProjectModel.findOne({ projectId: "demo" }).lean().exec();
    const baseVersion = project?.dbVersion ?? 1;

    // 3. Create StorylineNode bound to char_001 + evt_001
    await request(app)
      .post("/api/projects/demo/storyline-nodes")
      .send({
        nodeId: "story_1",
        characterId: "char_001",
        eventId: "evt_001",
        content: "Initial draft",
      })
      .expect(201);

    // 4. Update char_001 to trigger version bump and cascade
    await request(app)
      .put("/api/projects/demo/characters/char_001")
      .send({ coreTraits: ["Pragmatic", "Suspicious"] })
      .expect(200);

    project = await ProjectModel.findOne({ projectId: "demo" }).lean().exec();
    const newVersion = project?.dbVersion ?? 0;
    expect(newVersion).toBe(baseVersion + 1);

    const logs = await DbChangeLogModel.find({ projectId: "demo" })
      .sort({ toVersion: -1 })
      .lean()
      .exec();
    expect(logs[0].entityType).toBe("Character");
    expect(logs[0].entityIds).toEqual(["char_001"]);

    // Storyline node should now be marked as needs_revision
    const res = await request(app)
      .get("/api/projects/demo/storyline-nodes")
      .query({ status: "needs_revision" })
      .expect(200);

    expect(res.body.length).toBe(1);
    expect(res.body[0].nodeId).toBe("story_1");
    expect(res.body[0].status).toBe("needs_revision");
  });
});

