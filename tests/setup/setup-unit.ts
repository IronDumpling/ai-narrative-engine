/**
 * Unit test setup: ensure unit tests never accidentally use real LLM (use mocks only).
 */
process.env.OPENAI_API_KEY = "";
