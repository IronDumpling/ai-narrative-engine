import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import { setDataDirForTesting, clearDataDirOverride } from "../../backend/src/storage/jsonStore";

export class TestStorage {
  private dataDir: string = "";

  async setup(): Promise<void> {
    this.dataDir = path.join(os.tmpdir(), `narrative-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(this.dataDir, { recursive: true });
    setDataDirForTesting(this.dataDir);
  }

  async cleanup(): Promise<void> {
    if (!this.dataDir) return;
    try {
      await fs.rm(this.dataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  async teardown(): Promise<void> {
    await this.cleanup();
    clearDataDirOverride();
    this.dataDir = "";
  }
}
