import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../utils/logger.mjs'
import { createS3Client } from '../utils/awsClient.mjs'

const logger = createLogger('fileStorage')
const bucketName = process.env.FILES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export async function getUploadUrl(todoId, userId) {
  logger.info(`Generating upload URL for user ${userId} and ${todoId}`)
  const s3Client = createS3Client()

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${userId}/${todoId}`
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}

export async function getDownloadUrl(todoId, userId) {
  logger.info(`Generating download URL for user ${userId} and ${todoId}`)
  const s3Client = createS3Client()

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `${userId}/${todoId}`
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  
  return url
}

export function parseKey(record) {
  const key = decodeURIComponent(record.s3.object.key)
  const [userId, todoId] = key.split('/')
  return { userId, todoId }
}