import prisma from "@/lib/prisma"

// Helper function to create audit logs
export async function createAuditLog({
  employeeId,
  action,
  oldValues,
  newValues,
  editorUserId,
  editorUsername,
}: {
  employeeId: string
  action: string
  oldValues: any
  newValues: any
  editorUserId: string
  editorUsername: string
}) {
  // Determine which attributes were edited
  const attributesEdited = Object.keys(newValues).filter(
    (key) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]),
  )

  // For DELETE actions, all fields in oldValues are considered deleted
  // For CREATE actions, all fields in newValues are considered new
  const finalAttributesEdited =
    action === "DELETE" ? Object.keys(oldValues) : action === "CREATE" ? Object.keys(newValues) : attributesEdited

  // Filter out updatedAt from the attributes edited
  const filteredAttributes = finalAttributesEdited.filter((attr) => attr !== "updatedAt" && attr !== "updatedBy")

  // Only create audit log if there are changes
  if (filteredAttributes.length === 0 && action !== "DELETE" && action !== "CREATE") {
    console.log("No changes detected, skipping audit log creation")
    return null
  }

  return prisma.auditLog.create({
    data: {
      logId: `LOG${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      dateOfUpdate: new Date(),
      timestamp: new Date(),
      attributesEdited: filteredAttributes,
      oldValues: oldValues,
      newValues: newValues,
      editorUsername,
      editorUserId,
      actionType: action,
    },
  })
}

