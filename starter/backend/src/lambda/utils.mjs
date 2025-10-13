import { parseUserId } from '../auth/utils.mjs'

export function getUserId(event) {
  const authHeader = event.headers.Authorization || event.headers.authorization
  if (!authHeader) throw new Error('Missing Authorization header');

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) throw new Error('Invalid Authorization header format');

  return parseUserId(token)
}
