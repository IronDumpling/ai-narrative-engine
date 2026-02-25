import mongoose, { Schema, Document, Model } from "mongoose";

export interface Relationship {
  targetId: string;
  relationType: string;
  knowledge?: string;
}

export interface CharacterDocument extends Document {
  projectId: string;
  characterId: string;
  name: string;
  coreTraits: string[];
  flaws: string[];
  motivations: string[];
  relationships: Relationship[];
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema = new Schema<Relationship>(
  {
    targetId: { type: String, required: true },
    relationType: { type: String, required: true },
    knowledge: { type: String },
  },
  { _id: false }
);

const CharacterSchema = new Schema<CharacterDocument>(
  {
    projectId: { type: String, required: true, index: true },
    characterId: { type: String, required: true },
    name: { type: String, required: true },
    coreTraits: { type: [String], default: [] },
    flaws: { type: [String], default: [] },
    motivations: { type: [String], default: [] },
    relationships: { type: [RelationshipSchema], default: [] },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

CharacterSchema.index({ projectId: 1, characterId: 1 }, { unique: true });

export const CharacterModel: Model<CharacterDocument> =
  mongoose.models.Character || mongoose.model<CharacterDocument>("Character", CharacterSchema);

