import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');

const jwksUrl = 'https://dev-ol326uhiocrmop0u.us.auth0.com/.well-known/jwks.json';

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message, stack: e.stack });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = jsonwebtoken.decode(token, { complete: true });

  if (!jwt) {
    throw new Error('Invalid token');
  }

  const cert = await getCertificate(jwt.header.kid);

  return jsonwebtoken.verify(token, cert, {
    algorithms: ['RS256'],
    issuer: 'https://dev-ol326uhiocrmop0u.us.auth0.com/',
    audience: 'https://dev-ol326uhiocrmop0u.us.auth0.com/api/v2/',
  });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

async function getCertificate(key_id) {
  const response = await axios.get(jwksUrl);
  const keys = response.data.keys;
  const signingKey = keys.find((key) => key.kid === key_id);

  if (!signingKey) {
    throw new Error('Invalid signing key');
  }

  const cert = signingKey.x5c[0];
  return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
}
