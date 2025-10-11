// See your task for this function the serverless file.
// See the /backend/src/lambda/http/updateTodo.js file. 
// It should update a TODO item created by a current user. 
// The shape of data send by a client application to this function 
// can be found in the /backend/src/requests/UpdateTodoRequest.js file. 
// It receives an object that contains three fields that can be 
// updated in a TODO item:
// {
//     "name": "Buy bread",
//     "dueDate": "2022-12-12",
//     "done": true
// }
// The ID of an item that should be updated is passed as a URL parameter. 
// It should return an empty body.

import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs' 
import { updateTodo, getTodo } from '../../businessLogic/todos.mjs'
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

      const updatedTodo = JSON.parse(event.body)
      await updateTodo(todoId, userId, updatedTodo)
      return {
        statusCode: 200
      }
    } catch (e) {
      logger.error('Error updating todo', { error: e.message })
      // Handle JSON parsing errors
      if (e instanceof SyntaxError) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ 
            error: 'Invalid JSON in request body' 
          }) 
        }
      }
      // Handle other potential errors from business logic or AWS SDK
      return {
        statusCode: 503,
        body: JSON.stringify({
          error: 'Service is temporarily unavailable, please try again later.'
        })
      }
    }
  })