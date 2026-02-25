import mongoose, { Schema, Document, Model } from "mongoose";

export interface EventDocument extends Document {
  projectId: string;
  eventId: string;
  timelineOrder: number;
  title: string;
  objectiveFacts: string;
  involvedCharacterIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<EventDocument>(
  {
    projectId: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    timelineOrder: { type: Number, required: true },
    title: { type: String, required: true },
    objectiveFacts: { type: String, required: true },
    involvedCharacterIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

EventSchema.index({ projectId: 1, eventId: 1 }, { unique: true });
EventSchema.index({ projectId: 1, timelineOrder: 1 });

export const EventModel: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

