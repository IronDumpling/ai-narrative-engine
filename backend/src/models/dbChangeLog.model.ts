import mongoose, { Schema, Document, Model } from "mongoose";

export type EntityType = "Character" | "WorldRule" | "Event";

export interface DbChangeLogDocument extends Document {
  projectId: string;
  fromVersion: number;
  toVersion: number;
  entityType: EntityType;
  entityIds: string[];
  changeSummary?: string;
  createdAt: Date;
}

const DbChangeLogSchema = new Schema<DbChangeLogDocument>(
  {
    projectId: { type: String, required: true, index: true },
    fromVersion: { type: Number, required: true },
    toVersion: { type: Number, required: true },
    entityType: { type: String, required: true },
    entityIds: { type: [String], required: true },
    changeSummary: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DbChangeLogSchema.index({ projectId: 1, toVersion: 1 });

export const DbChangeLogModel: Model<DbChangeLogDocument> =
  mongoose.models.DbChangeLog || mongoose.model<DbChangeLogDocument>("DbChangeLog", DbChangeLogSchema);

