import { FastifyReply, FastifyRequest } from 'fastify';

import client from '../../models/db/client';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const deleteById = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.client_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete clients"
    });
  } 
  const { id } = request.params;
  const c = await client.findByPk(id);
  if (!c) {
    return reply.status(404).send({ message: "client not found" });
  }

  await c.destroy();
  reply.send({ message: 'successfully deleted' }).code(200);
};
