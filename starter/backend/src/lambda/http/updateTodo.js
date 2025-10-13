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
    const todoId = String(event.pathParameters.todoId)
    const todo = await getTodo(todoId, userId)

    // Check if todo item exists
    if (!todo) {
      throw createError(404, 'Todo not found')
    }

    const updatedTodo = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const todoToUpdate = {
      name: updatedTodo.name !== undefined ? updatedTodo.name : todo.name,
      dueDate: updatedTodo.dueDate !== undefined ? updatedTodo.dueDate : todo.dueDate,
      done: updatedTodo.done !== undefined ? updatedTodo.done : todo.done
    }

    await updateTodo(todoId, userId, todoToUpdate)

    return {
      statusCode: 200,
      body: ''
    }
  })