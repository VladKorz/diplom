import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import object from '../../models/db/object';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.rent_object_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view objects"
    });
  } 
  const objects = await object.findAll();

  reply.send({ 
    message: "Objects retrieved successfully",
    objects: objects 
  }).code(200);
};

export const getById = async (request: FastifyRequest < { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.rent_object_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view objects"
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

  reply.send({ 
    message: "Object retrieved successfully",
    object: objectInfo
  }).code(200);
};
