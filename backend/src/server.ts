import http from "http";
import { createApp } from "./app";
import { connectMongo } from "./config/db";
import { ENV } from "./config/env";

async function bootstrap() {
  await connectMongo();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(ENV.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Narrative engine listening on port ${ENV.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});

