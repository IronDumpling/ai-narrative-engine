import { TestDb } from "../helpers/testDb";
import {
  buildBridgerPayloadForEvents,
  buildBridgerPayloadForNode,
  buildValidatorPayload,
} from "../../backend/src/services/contextRouterService";
import { CharacterModel } from "../../backend/src/models/character.model";
import { WorldRuleModel } from "../../backend/src/models/worldRule.model";
import { EventModel } from "../../backend/src/models/event.model";
import { StorylineNodeModel } from "../../backend/src/models/storylineNode.model";

jest.setTimeout(60000);

const testDb = new TestDb();

describe("contextRouterService", () => {
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
    await CharacterModel.create({
      projectId: "demo",
      characterId: "char_001",
      name: "Elias",
      coreTraits: ["Pragmatic", "Suspicious"],
      flaws: [],
      motivations: [],
      relationships: [],
    });

    await WorldRuleModel.create({
      projectId: "demo",
      ruleId: "rule_001",
      category: "Physics_Magic",
      description: "Using neural-implants drains physical stamina exponentially.",
      strictnessLevel: "High",
    });

    await EventModel.create({
      projectId: "demo",
      eventId: "evt_001",
      timelineOrder: 10,
      title: "The Server Room Breach",
      objectiveFacts: "The main server was destroyed at 02:00 AM by an unknown explosive.",
      involvedCharacterIds: ["char_001"],
    });
  });

  it("builds Bridger payload for events according to spec", async () => {
    const payload = await buildBridgerPayloadForEvents({
      projectId: "demo",
      characterId: "char_001",
      startEventId: "evt_001",
      endEventId: "evt_001",
    });

    expect(payload.task).toContain("Generate POV storyline");
    expect(payload.character_context).toBeDefined();
    expect(Array.isArray(payload.world_context)).toBe(true);
    expect(payload.start_event).toContain("evt_001");
    expect(payload.end_event).toContain("evt_001");
  });

  it("builds Bridger payload for node including existing content", async () => {
    await StorylineNodeModel.create({
      projectId: "demo",
      nodeId: "story_1",
      characterId: "char_001",
      eventId: "evt_001",
      content: "Existing content",
    });

    const payload = await buildBridgerPayloadForNode({
      projectId: "demo",
      nodeId: "story_1",
    });

    expect(payload.existing_content).toBe("Existing content");
    expect(payload.start_event).toContain("evt_001");
  });

  it("builds Validator payload with character traits and world rule descriptions", async () => {
    const payload = await buildValidatorPayload({
      projectId: "demo",
      characterId: "char_001",
      textToVerify: "Some text",
    });

    expect(payload.task).toContain("Verify if the provided text");
    expect(payload.character_traits).toEqual(["Pragmatic", "Suspicious"]);
    expect(payload.world_rules[0]).toContain("neural-implants drains physical stamina");
    expect(payload.text_to_verify).toBe("Some text");
  });
});

