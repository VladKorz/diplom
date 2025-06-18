import { FastifyReply, FastifyRequest } from 'fastify';

import object from '../../models/db/object';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const deleteById = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.rent_object_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete rent objects"
    });
  } 
  const { id } = request.params;
  const objectInfo = await object.findByPk(id);
  if (!objectInfo) {
    return reply.status(404).send({ 
      error: "Object not found",
      message: "The specified object does not exist"
    });
  }

  await objectInfo.destroy();
  reply.send({ 
    message: "Object deleted successfully"
  }).code(200);
};
