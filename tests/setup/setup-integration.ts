/**
 * Integration test setup: load backend/.env so OPENAI_API_KEY is available for real LLM calls.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend", ".env") });
