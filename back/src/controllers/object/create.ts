import { FastifyReply, FastifyRequest } from 'fastify';

import rentObject from '../../models/db/object';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const create = async (request: FastifyRequest< { Body: coreType.objectBasicInfo } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
    
  if (await hasPermission(userToken.id, coreType.role.rent_object_create) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to create rent objects"
    });
  } 
  const { name, description, costPerHour } = request.body;

  const objectInfo: dbType.objectDbRecordCreationAttributes = {
    name: name,
    description: description,
    costPerHour: costPerHour,
  };

  const createdObject = await rentObject.create(objectInfo);

  reply.send({ 
    message: "Object created successfully",
    object: createdObject
  }).code(201);
};
