import { FastifyReply, FastifyRequest } from 'fastify';

import service from '../../models/db/service';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.serviceUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.service_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit services"
    });
  } 
  
  const { name, description, price } = request.body;
  const { id } = request.params;

  // Check if service exists
  const existingService = await service.findByPk(id);
  if (!existingService) {
    return reply.status(404).send({ 
      error: "Service not found",
      message: "The specified service does not exist"
    });
  }

  const serviceInfo: coreType.serviceUpdateBasicInfo = {
    name: name?.trim(),
    description: description?.trim(),
    price: price
  };

  await service.update(serviceInfo, { where: { id: id } });
  const updatedService = await service.findByPk(id);

  reply.send({ 
    message: "Service updated successfully",
    service: updatedService
  }).code(200);
}; 