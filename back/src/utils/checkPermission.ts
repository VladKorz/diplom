import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../types/core';
import hasPermission from './hasPermission';

export const checkPermission = async (request: FastifyRequest, reply: FastifyReply, perm: coreType.role) => {
  if (await hasPermission(request.user.id, perm) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to perform this action"
    });
  }
}; 