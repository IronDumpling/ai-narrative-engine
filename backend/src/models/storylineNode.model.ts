import mongoose, { Schema, Document, Model } from "mongoose";

export type StorylineStatus = "draft" | "stable" | "needs_revision";

export interface LastCheckResult {
  pass: boolean;
  violations: {
    type: string;
    severity: string;
    reason: string;
  }[];
  checkedAt: Date;
}

export interface StorylineNodeDocument extends Document {
  projectId: string;
  nodeId: string;
  characterId: string;
  eventId: string;
  content: string;
  versionHash?: string;
  dbVersionSnapshot?: number;
  status: StorylineStatus;
  lastCheckResult?: LastCheckResult;
  createdAt: Date;
  updatedAt: Date;
}

const ViolationSchema = new Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const LastCheckResultSchema = new Schema<LastCheckResult>(
  {
    pass: { type: Boolean, required: true },
    violations: { type: [ViolationSchema], default: [] },
    checkedAt: { type: Date, required: true },
  },
  { _id: false }
);

const StorylineNodeSchema = new Schema<StorylineNodeDocument>(
  {
    projectId: { type: String, required: true, index: true },
    nodeId: { type: String, required: true },
    characterId: { type: String, required: true },
    eventId: { type: String, required: true },
    content: { type: String, required: true, default: "" },
    versionHash: { type: String },
    dbVersionSnapshot: { type: Number },
    status: {
      type: String,
      enum: ["draft", "stable", "needs_revision"],
      default: "draft",
      required: true,
    },
    lastCheckResult: { type: LastCheckResultSchema },
  },
  { timestamps: true }
);

StorylineNodeSchema.index({ projectId: 1, nodeId: 1 }, { unique: true });
StorylineNodeSchema.index({ projectId: 1, characterId: 1, eventId: 1 });

export const StorylineNodeModel: Model<StorylineNodeDocument> =
  mongoose.models.StorylineNode || mongoose.model<StorylineNodeDocument>("StorylineNode", StorylineNodeSchema);

