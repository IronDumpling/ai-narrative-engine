import http from "http";
import { createApp } from "./app";
import { ENV } from "./config/env";

async function bootstrap() {
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

