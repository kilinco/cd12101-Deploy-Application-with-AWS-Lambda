import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs' 
import { deleteTodo, getTodo } from '../../businessLogic/todos.mjs'
import createError from 'http-errors'
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
    const todoId = event.pathParameters.todoId
    const todo = await getTodo(todoId, userId)

    // Check if todo item exists
    if (!todo) {
      throw createError(404, 'Todo not found')
    }

    await deleteTodo(todoId, userId)
    return {
      statusCode: 200,
      body: ''
    }
  })
