/**
 * Plain data types for JSON storage (Route B: no versioning).
 * Version management fields (dbVersion, DbChangeLog, needs_revision cascade) reserved for future.
 */

export interface Relationship {
  targetId: string;
  relationType: string;
  knowledge?: string;
}

export interface Character {
  projectId: string;
  characterId: string;
  name: string;
  coreTraits: string[];
  flaws: string[];
  motivations: string[];
  relationships: Relationship[];
  meta?: Record<string, unknown>;
}

export interface WorldRule {
  projectId: string;
  ruleId: string;
  category: string;
  description: string;
  strictnessLevel?: string;
}

export interface Event {
  projectId: string;
  eventId: string;
  timelineOrder: number;
  title: string;
  objectiveFacts: string;
  involvedCharacterIds: string[];
}

export type StorylineStatus = "draft" | "stable" | "needs_revision";

export interface LastCheckResult {
  pass: boolean;
  violations: { type: string; severity: string; reason: string }[];
  checkedAt: string;
}

export interface StorylineNode {
  projectId: string;
  nodeId: string;
  characterId: string;
  eventId: string;
  content: string;
  status: StorylineStatus;
  lastCheckResult?: LastCheckResult;
}

export interface ProjectMeta {
  projectId: string;
  name: string;
  description?: string;
}

export interface ProjectData {
  projectId: string;
  name: string;
  description?: string;
  characters: Character[];
  worldRules: WorldRule[];
  events: Event[];
  storylineNodes: StorylineNode[];
}
