import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs' 
import { deleteTodo, getTodo } from '../../businessLogic/todos.mjs'
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
    try {
      const userId = getUserId(event)

      logger.info('Processing event: ', event)
      const todoId = event.pathParameters.todoId
      const todo = await getTodo(todoId, userId)

      // Check if todo item exists
      if (!todo.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: 'Todo not found'
          })
        }
      }

      await deleteTodo(todoId, userId)
      return {
        statusCode: 200
      }
    } catch (e) {
      logger.error('Error deleting todo', { error: e.message })
      return { 
        statusCode: 503, 
        body: JSON.stringify({ 
          error: 'Service is temporarily unavailable, please try again later.'
        })
      }
    }
  })
