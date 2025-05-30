import { FastifyReply, FastifyRequest } from 'fastify';

import service from '../../models/db/service';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const remove = async (request: FastifyRequest< { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.service_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete services"
    });
  }

  const { id } = request.params;

  // Check if service exists
  const existingService = await service.findByPk(id);
  if (!existingService) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Service not found"
    });
  }

  await existingService.destroy();

  reply.send({ 
    message: "Service deleted successfully"
  }).code(200);
}; 