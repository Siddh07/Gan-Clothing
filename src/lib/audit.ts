import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any> | string;
}

export async function logAuditAction({
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: LogAuditParams) {
  try {
    const stringifiedMeta =
      typeof metadata === "object" ? JSON.stringify(metadata) : metadata || null;

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId,
        metadata: stringifiedMeta,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
