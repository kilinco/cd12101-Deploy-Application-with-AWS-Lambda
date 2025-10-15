import { fileUploaded, getTodo } from '../../businessLogic/todos.mjs'
import { parseKey } from '../../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('fileUpload')

export const handler = async (event) => {
  logger.debug('File upload handler is executed')
  for (const record of event.Records) {
    logger.info(`Processing record`, record)
    const { userId, todoId } = parseKey(record)
    const todo = await getTodo(todoId, userId)
    if (!todo) {
      logger.error(`Todo not found for id ${todoId} and user ${userId}`)
      continue
    }
    await fileUploaded(todoId, userId)
  }
}
