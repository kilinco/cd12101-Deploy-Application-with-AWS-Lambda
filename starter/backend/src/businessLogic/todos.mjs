import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { getDownloadUrl } from '../fileStorage/attachmentUtils.mjs'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId) {
  const result = await todoAccess.getAllTodos(userId)
  const todos = await Promise.all(result.map(async (todo) => {
    if (todo.hasFile) {
      todo.attachmentUrl = await getDownloadUrl(todo.todoId, userId)
    } else {
      todo.attachmentUrl = ''
    }
    return todo
  }))
  return todos
}

export async function createTodo(createTodoRequest, userId) {
  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    hasFile: false,
  })
}

export async function getTodo(todoId, userId) {
  return await todoAccess.getTodo(todoId,userId)
}

export async function updateTodo(todoId, userId, updateTodoRequest) {
  return await todoAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(todoId, userId) {
  return await todoAccess.deleteTodo(todoId, userId);
}

export async function fileUploaded(todoId, userId) {
  return await todoAccess.fileUploaded(todoId, userId);
}
