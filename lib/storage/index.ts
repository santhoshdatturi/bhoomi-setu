import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.AWS_ENDPOINT_URL_S3) {
  throw new Error("Missing AWS_ENDPOINT_URL_S3 environment variable");
}

export const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for S3-compatible endpoints
});

/**
 * Generate a presigned URL for direct client-side uploads to S3
 */
export async function generatePresignedUploadUrl(bucket: string, fileId: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileId,
    ContentType: contentType,
  });

  // URL expires in 15 minutes
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
}

/**
 * Generate a presigned URL for client-side downloads from S3
 */
export async function generatePresignedDownloadUrl(bucket: string, fileId: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileId,
  });

  // URL expires in 1 hour (3600 seconds)
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Delete a file from S3 storage
 */
export async function deleteFileFromStorage(bucket: string, fileId: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: fileId,
  });

  return s3Client.send(command);
}

/**
 * Get presigned URL for a file
 */
export async function getFileUrl(bucket: string, fileId: string) {
  return generatePresignedDownloadUrl(bucket, fileId);
}

/**
 * Fetch raw file bytes from S3 storage
 */
export async function getFileBytes(bucket: string, fileId: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileId,
  });
  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error(`Empty body returned for file ${fileId} in bucket ${bucket}`);
  }
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
}
