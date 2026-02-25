import mongoose, { Schema, Document, Model } from "mongoose";

export interface ProjectDocument extends Document {
  projectId: string;
  name: string;
  description?: string;
  dbVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    dbVersion: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export const ProjectModel: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>("Project", ProjectSchema);

