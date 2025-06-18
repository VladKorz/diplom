import * as f from 'fastify';

import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import fAuth from '@fastify/auth';

import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

import route from './routes/index';

import * as coreType from './types/core';

const app = f.fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

app.register(fCookie, {
  secret: 'some-secret-key', // Use environment variables in production
  hook: 'preHandler',
});

app.register(fjwt, {
  secret: 'supersecretcode-CHANGE_THIS-USE_ENV_FILE', // Use environment variables in production
});

app.register(fp(fAuth));

app.register(cors, {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (_request, context) => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry in ${context.after} seconds.`,
    };
  },
});

app.decorate(
  'authenticate',
  async (request: f.FastifyRequest, reply: f.FastifyReply) => {
    try {
      const decodedToken = await request.jwtVerify();
      request.user = decodedToken.valueOf() as coreType.userBasicInfo & coreType.id;
    } catch (err) {
      reply.status(401).send({ message: 'Authentication required' });
    }
  },
);

app.register(route, { prefix: '/api' });

export default app;
