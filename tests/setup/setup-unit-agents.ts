/**
 * Unit test setup for agent tests: set a dummy OPENAI_API_KEY so agents pass the guard.
 * The actual OpenAI calls are mocked via jest.mock("openai").
 */
process.env.OPENAI_API_KEY = "sk-test-key-for-mocked-unit-test";
