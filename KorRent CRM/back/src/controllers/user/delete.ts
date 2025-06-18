import { FastifyReply, FastifyRequest } from 'fastify';

import user from '../../models/db/user';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const deleteById = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.user_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete users"
    });
  }

  const { id } = request.params;
  const u = await user.findByPk(id);
  if (!u) {
    return reply.status(404).send({ message: "user not found" });
  }

  await u.destroy();
  reply.send({ message: 'successfully deleted' }).code(200);
};
