import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import createError from 'http-errors'
import { getUserId } from '../utils.mjs'
import { getTodo } from '../../businessLogic/todos.mjs'
import { getUploadUrl } from '../../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../../utils/logger.mjs'
 
const logger = createLogger('http')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const userId = getUserId(event)

    logger.info('Processing event: ', event)
    const todoId = String(event.pathParameters.todoId)
    const todo = await getTodo(todoId, userId)

    if (!todo) {
      throw createError(404, 'Todo not found')
    }

    const url = await getUploadUrl(todoId, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  });