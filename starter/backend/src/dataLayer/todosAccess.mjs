import { createDynamoDbClient } from '../utils/awsClient.mjs';

import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('dataLayer')

export class TodoAccess {
  constructor(
    todosTable = process.env.TODOS_TABLE
  ) {
    this.todosTable = todosTable
    this.dynamoDbClient = createDynamoDbClient();
  }

  async getAllTodos(userId) {
    logger.info(`Getting all todos for ${userId}`)

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return result.Items || []
  }

  async createTodo(todo) {
    logger.info("Creating a todo item", todo)
    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })
    return todo
  }
  
  async getTodo(todoId, userId){
    logger.info(`Retrieving todo with id ${todoId} for user ${userId}`)
    const result = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    return result.Item;
  }


  async updateTodo(todoId, userId, updatedTodo) {
    logger.info(`Updating todo with id ${todoId} for user ${userId}`, updatedTodo)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        '#name': 'name' // reserved word
      },
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
      },
      ReturnValues: "NONE"
    })
    return
  }

  async deleteTodo(todoId, userId) {
    logger.info(`Deleting todo with id ${todoId} for user ${userId}`)

    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    return
  }
}
