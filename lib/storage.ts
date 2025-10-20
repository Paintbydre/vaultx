// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

// Initialize R2 client (R2 is S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!

export interface UploadResult {
  key: string
  url: string
  fileName: string
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  mimeType: string,
  options?: {
    folder?: string
    makePublic?: boolean
  }
): Promise<UploadResult> {
  // Generate unique filename to prevent collisions
  const fileExtension = fileName.split('.').pop()
  const uniqueFileName = `${nanoid()}.${fileExtension}`
  const key = options?.folder 
    ? `${options.folder}/${uniqueFileName}` 
    : uniqueFileName

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    Metadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  })

  await r2Client.send(command)

  // Generate URL (we'll use pre-signed URLs for download)
  const url = `https://${BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`

  return {
    key,
    url,
    fileName: uniqueFileName,
  }
}

/**
 * Generate a pre-signed download URL (expires in 1 hour by default)
 */
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Check if a file exists in R2
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    await r2Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

