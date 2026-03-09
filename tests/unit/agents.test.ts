/**
 * Unit tests for Bridger & Validator agents with mocked OpenAI.
 * No real LLM calls - uses jest.mock("openai").
 */
const mockCreate = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

import { callBridger } from "../../backend/src/agents/bridgerClient";
import { callValidator } from "../../backend/src/agents/validatorClient";
import type { BridgerPayload, ValidatorPayload } from "../../backend/src/services/contextRouterService";

describe("Bridger (mocked OpenAI)", () => {
  const bridgerPayload: BridgerPayload = {
    task: "Generate POV storyline connecting Start_Event and End_Event.",
    character_context: { characterId: "char_001", name: "Elias", coreTraits: ["Pragmatic"] },
    world_context: [{ description: "Magic drains stamina." }],
    start_event: "evt_001: The Breach",
    end_event: "evt_002: The Escape",
  };

  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns parsed bridging_steps from mock response", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              bridging_steps: [
                { step: 1, action: "Mock step one" },
                { step: 2, action: "Mock step two" },
              ],
            }),
          },
        },
      ],
    });

    const result = await callBridger(bridgerPayload);

    expect(result.bridging_steps).toHaveLength(2);
    expect(result.bridging_steps[0]).toEqual({ step: 1, action: "Mock step one" });
    expect(result.bridging_steps[1]).toEqual({ step: 2, action: "Mock step two" });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

describe("Validator (mocked OpenAI)", () => {
  const validatorPayload: ValidatorPayload = {
    task: "Verify if the provided text violates Character Traits or World Rules.",
    character_traits: ["Pragmatic", "Suspicious"],
    world_rules: ["Using neural-implants drains physical stamina exponentially."],
    text_to_verify: "I used my implant for hours without rest.",
  };

  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns pass and violations from mock response", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              pass: false,
              violations: [
                {
                  type: "rule",
                  severity: "high",
                  reason: "Text violates world rule about stamina drain.",
                },
              ],
            }),
          },
        },
      ],
    });

    const result = await callValidator(validatorPayload);

    expect(result.pass).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toEqual({
      type: "rule",
      severity: "high",
      reason: "Text violates world rule about stamina drain.",
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns pass true with empty violations", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ pass: true, violations: [] }) } }],
    });

    const result = await callValidator(validatorPayload);

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
