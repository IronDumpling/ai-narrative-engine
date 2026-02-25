import { DbChangeLogModel, DbChangeLogDocument, EntityType } from "../models/dbChangeLog.model";
import { ProjectModel } from "../models/project.model";
import { StorylineNodeModel, StorylineStatus } from "../models/storylineNode.model";

export async function incrementProjectVersionAndLogChanges(
  projectId: string,
  entityType: EntityType,
  entityIds: string[],
  changeSummary?: string
): Promise<DbChangeLogDocument> {
  const project = await ProjectModel.findOneAndUpdate(
    { projectId },
    { $inc: { dbVersion: 1 } },
    { new: true }
  ).exec();

  if (!project) {
    throw new Error(`Project not found for projectId=${projectId}`);
  }

  const log = await DbChangeLogModel.create({
    projectId,
    fromVersion: project.dbVersion - 1,
    toVersion: project.dbVersion,
    entityType,
    entityIds,
    changeSummary,
  });

  return log;
}

export async function markAffectedStorylineNodes(
  projectId: string,
  entityType: EntityType,
  entityIds: string[],
  toVersion: number
): Promise<number> {
  const match: Record<string, unknown> = {
    projectId,
    $or: [],
  };

  if (entityType === "Character") {
    (match.$or as unknown[]).push({ characterId: { $in: entityIds } });
  } else if (entityType === "Event") {
    (match.$or as unknown[]).push({ eventId: { $in: entityIds } });
  } else if (entityType === "WorldRule") {
    // World rules affect all nodes in the project; $or is not needed in this case.
    delete match.$or;
  }

  const statusNeedsRevision: StorylineStatus = "needs_revision";

  const update = await StorylineNodeModel.updateMany(
    {
      ...match,
      $or: [
        { dbVersionSnapshot: { $lt: toVersion } },
        { dbVersionSnapshot: { $exists: false } },
      ],
    },
    {
      $set: {
        status: statusNeedsRevision,
        dbVersionSnapshot: toVersion,
      },
    }
  ).exec();

  return update.modifiedCount ?? 0;
}

