import { FastifyReply, FastifyRequest } from 'fastify';

import service from '../../models/db/service';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const create = async (request: FastifyRequest< { Body: coreType.serviceBasicInfo } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.service_create) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to create services"
    });
  }

  const { name, description, price } = request.body;
  if (price <= 0) {
    return reply.status(400).send({ 
      error: "Invalid input",
      message: "Service price must be greater than zero"
    });
  }

  const serviceInfo: dbType.serviceDbRecordCreationAttributes = {
    name: name.trim(),
    description: description.trim(),
    price: price
  };

  const createdService = await service.create(serviceInfo);

  reply.send({ 
    message: "Service created successfully",
    service: createdService
  }).code(201);
}; 