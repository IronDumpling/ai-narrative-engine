import * as fs from "fs/promises";
import * as path from "path";

import type {
  ProjectMeta,
  ProjectData,
  Character,
  WorldRule,
  Event,
  StorylineNode,
} from "./types";

const PROJECTS_FILE = "projects.json";
const PROJECTS_DIR = "projects";

let _dataDirOverride: string | null = null;

/** For tests: override data directory. Call clearDataDirOverride() in afterAll. */
export function setDataDirForTesting(dir: string): void {
  _dataDirOverride = dir;
}

export function clearDataDirOverride(): void {
  _dataDirOverride = null;
}

function getDataDir(): string {
  if (_dataDirOverride) return _dataDirOverride;
  const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

function projectsPath(): string {
  return path.join(getDataDir(), PROJECTS_FILE);
}

function projectDataPath(projectId: string): string {
  return path.join(getDataDir(), PROJECTS_DIR, `${projectId}.json`);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const data = await readJson<ProjectMeta[]>(projectsPath());
  return data ?? [];
}

export async function createProject(meta: ProjectMeta): Promise<ProjectMeta> {
  const projects = await listProjects();
  if (projects.some((p) => p.projectId === meta.projectId)) {
    throw new Error(`Project ${meta.projectId} already exists`);
  }
  projects.push(meta);
  await writeJson(projectsPath(), projects);

  const projectData: ProjectData = {
    projectId: meta.projectId,
    name: meta.name,
    ...(meta.description !== undefined && { description: meta.description }),
    characters: [],
    worldRules: [],
    events: [],
    storylineNodes: [],
  };
  await writeJson(projectDataPath(meta.projectId), projectData);
  return meta;
}

export async function getProjectData(projectId: string): Promise<ProjectData | null> {
  return readJson<ProjectData>(projectDataPath(projectId));
}

async function saveProjectData(data: ProjectData): Promise<void> {
  await writeJson(projectDataPath(data.projectId), data);
}

export async function ensureProject(projectId: string): Promise<ProjectData> {
  const data = await getProjectData(projectId);
  if (!data) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return data;
}

// --- Characters ---
export async function findCharacters(projectId: string): Promise<Character[]> {
  const data = await getProjectData(projectId);
  return data?.characters ?? [];
}

export async function createCharacter(projectId: string, char: Omit<Character, "projectId">): Promise<Character> {
  const data = await ensureProject(projectId);
  if (data.characters.some((c) => c.characterId === char.characterId)) {
    throw new Error(`Character ${char.characterId} already exists`);
  }
  const created: Character = { ...char, projectId };
  data.characters.push(created);
  await saveProjectData(data);
  return created;
}

export async function updateCharacter(
  projectId: string,
  characterId: string,
  updates: Partial<Omit<Character, "projectId" | "characterId">>
): Promise<Character | null> {
  const data = await getProjectData(projectId);
  if (!data) return null;
  const idx = data.characters.findIndex((c) => c.characterId === characterId);
  if (idx < 0) return null;
  const existing = data.characters[idx];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<Character, "projectId" | "characterId">>;
  data.characters[idx] = { ...existing, ...filtered } as Character;
  await saveProjectData(data);
  return data.characters[idx] ?? null;
}

export async function deleteCharacter(projectId: string, characterId: string): Promise<boolean> {
  const data = await getProjectData(projectId);
  if (!data) return false;
  const before = data.characters.length;
  data.characters = data.characters.filter((c) => c.characterId !== characterId);
  if (data.characters.length === before) return false;
  await saveProjectData(data);
  return true;
}

// --- WorldRules ---
export async function findWorldRules(projectId: string): Promise<WorldRule[]> {
  const data = await getProjectData(projectId);
  return data?.worldRules ?? [];
}

export async function createWorldRule(projectId: string, rule: Omit<WorldRule, "projectId">): Promise<WorldRule> {
  const data = await ensureProject(projectId);
  if (data.worldRules.some((r) => r.ruleId === rule.ruleId)) {
    throw new Error(`WorldRule ${rule.ruleId} already exists`);
  }
  const created: WorldRule = { ...rule, projectId };
  data.worldRules.push(created);
  await saveProjectData(data);
  return created;
}

export async function updateWorldRule(
  projectId: string,
  ruleId: string,
  updates: Partial<Omit<WorldRule, "projectId" | "ruleId">>
): Promise<WorldRule | null> {
  const data = await getProjectData(projectId);
  if (!data) return null;
  const idx = data.worldRules.findIndex((r) => r.ruleId === ruleId);
  if (idx < 0) return null;
  const existing = data.worldRules[idx];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<WorldRule, "projectId" | "ruleId">>;
  data.worldRules[idx] = { ...existing, ...filtered } as WorldRule;
  await saveProjectData(data);
  return data.worldRules[idx] ?? null;
}

export async function deleteWorldRule(projectId: string, ruleId: string): Promise<boolean> {
  const data = await getProjectData(projectId);
  if (!data) return false;
  const before = data.worldRules.length;
  data.worldRules = data.worldRules.filter((r) => r.ruleId !== ruleId);
  if (data.worldRules.length === before) return false;
  await saveProjectData(data);
  return true;
}

// --- Events ---
export async function findEvents(projectId: string): Promise<Event[]> {
  const data = await getProjectData(projectId);
  return data?.events ?? [];
}

export async function createEvent(projectId: string, evt: Omit<Event, "projectId">): Promise<Event> {
  const data = await ensureProject(projectId);
  if (data.events.some((e) => e.eventId === evt.eventId)) {
    throw new Error(`Event ${evt.eventId} already exists`);
  }
  const created: Event = { ...evt, projectId };
  data.events.push(created);
  await saveProjectData(data);
  return created;
}

export async function updateEvent(
  projectId: string,
  eventId: string,
  updates: Partial<Omit<Event, "projectId" | "eventId">>
): Promise<Event | null> {
  const data = await getProjectData(projectId);
  if (!data) return null;
  const idx = data.events.findIndex((e) => e.eventId === eventId);
  if (idx < 0) return null;
  const existing = data.events[idx];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<Event, "projectId" | "eventId">>;
  data.events[idx] = { ...existing, ...filtered } as Event;
  await saveProjectData(data);
  return data.events[idx] ?? null;
}

export async function deleteEvent(projectId: string, eventId: string): Promise<boolean> {
  const data = await getProjectData(projectId);
  if (!data) return false;
  const before = data.events.length;
  data.events = data.events.filter((e) => e.eventId !== eventId);
  if (data.events.length === before) return false;
  await saveProjectData(data);
  return true;
}

// --- StorylineNodes ---
export async function findStorylineNodes(
  projectId: string,
  filter?: { status?: string }
): Promise<StorylineNode[]> {
  const data = await getProjectData(projectId);
  let nodes = data?.storylineNodes ?? [];
  if (filter?.status) {
    nodes = nodes.filter((n) => n.status === filter.status);
  }
  return nodes;
}

export async function createStorylineNode(
  projectId: string,
  node: Omit<StorylineNode, "projectId" | "status"> & { status?: StorylineNode["status"] }
): Promise<StorylineNode> {
  const data = await ensureProject(projectId);
  if (data.storylineNodes.some((n) => n.nodeId === node.nodeId)) {
    throw new Error(`StorylineNode ${node.nodeId} already exists`);
  }
  const created: StorylineNode = {
    ...node,
    projectId,
    status: (node.status as StorylineNode["status"]) ?? "draft",
  };
  data.storylineNodes.push(created);
  await saveProjectData(data);
  return created;
}

export async function updateStorylineNode(
  projectId: string,
  nodeId: string,
  updates: Partial<Omit<StorylineNode, "projectId" | "nodeId">>
): Promise<StorylineNode | null> {
  const data = await getProjectData(projectId);
  if (!data) return null;
  const idx = data.storylineNodes.findIndex((n) => n.nodeId === nodeId);
  if (idx < 0) return null;
  const existing = data.storylineNodes[idx];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<StorylineNode, "projectId" | "nodeId">>;
  data.storylineNodes[idx] = { ...existing, ...filtered } as StorylineNode;
  await saveProjectData(data);
  return data.storylineNodes[idx] ?? null;
}

export async function findStorylineNode(projectId: string, nodeId: string): Promise<StorylineNode | null> {
  const data = await getProjectData(projectId);
  return data?.storylineNodes.find((n) => n.nodeId === nodeId) ?? null;
}
