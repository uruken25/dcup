import { databaseDrizzle } from "@/db";
import { connections } from "@/db/schemas/connections";
import { eq } from "drizzle-orm";
import { connectionConfig } from "../utils";


export const setAWSConnection = async (formData: FormData) => {
  const config = connectionConfig.safeParse({
    connectionId: formData.get("connectionId"),
    identifier: formData.get("connectionName"),
    folderName: formData.get("folderName"),
    folderId: formData.get("folderId"),
    metadata: formData.get("metadata"),
    pageLimit: formData.get("pageLimit"),
    documentLimit: formData.get("documentLimit"),
    maxPages: formData.get("maxPages")
  })

  if (!config.success) {
    const errors = config.error.errors
      .map(err => {
        const fieldPath = err.path.length > 0 ? err.path.join('.') : 'value'
        return `"${fieldPath}": ${err.message}`
      })
      .join('; ')
    throw new Error(`Validation errors - ${errors}`)
  }

  await databaseDrizzle.update(connections).set({
    identifier: config.data.identifier,
    folderName: config.data.folderName,
    connectionMetadata: config.data.folderId ? {
      folderId: config.data.folderId,
    } : undefined,
    metadata: config.data.metadata,
    isConfigSet: true,
    isSyncing: true,
    limitPages:config.data.pageLimit,
    limitFiles: config.data.documentLimit,
  }).where(eq(connections.id, config.data.connectionId))

  return {
    connectionId: config.data.connectionId,
    service: "AWS",
    pageLimit: config.data.maxPages,
    fileLimit: config.data.documentLimit,
    metadata: config.data.metadata,
    files: [],
    links: []
  }
}
