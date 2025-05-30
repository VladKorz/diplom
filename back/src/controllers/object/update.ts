import { FastifyReply, FastifyRequest } from 'fastify';

import object from '../../models/db/object';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.objectUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.rent_object_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit rent objects"
    });
  }
  const { name, description, costPerHour } = request.body;
  const { id } = request.params;

  const objectRecord = await object.findByPk(id);
  if (!objectRecord) {
    return reply.status(404).send({ 
      error: "Object not found",
      message: "The specified object does not exist"
    });
  }

  const objectInfo: coreType.objectUpdateBasicInfo = {
    name: name,
    description: description,
    costPerHour: costPerHour,
  };

  await object.update(objectInfo, { where: { id: id } });

  reply.send({ 
    message: "Object updated successfully",
    object: await object.findByPk(id)
  }).code(200);
};
