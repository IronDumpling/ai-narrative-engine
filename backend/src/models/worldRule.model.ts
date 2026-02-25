import mongoose, { Schema, Document, Model } from "mongoose";

export interface WorldRuleDocument extends Document {
  projectId: string;
  ruleId: string;
  category: string;
  description: string;
  strictnessLevel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorldRuleSchema = new Schema<WorldRuleDocument>(
  {
    projectId: { type: String, required: true, index: true },
    ruleId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    strictnessLevel: { type: String },
  },
  { timestamps: true }
);

WorldRuleSchema.index({ projectId: 1, ruleId: 1 }, { unique: true });

export const WorldRuleModel: Model<WorldRuleDocument> =
  mongoose.models.WorldRule || mongoose.model<WorldRuleDocument>("WorldRule", WorldRuleSchema);

