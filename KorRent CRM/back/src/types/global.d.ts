// src/types/global.d.ts
import { FastifyReply } from 'fastify';
import { JWT } from '@fastify/jwt';
import * as coreType from '../types/core'

import "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: coreType.id & coreType.userBasicInfo,
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
    user: coreType.userBasicInfo & coreType.id;
    
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
