import { FastifyReply, FastifyRequest } from 'fastify';

import hasPermission from '../../utils/hasPermission';
import user from '../../models/db/user';
import permission from '../../models/db/permission';
import * as coreType from '../../types/core';

export const assign = async (
  request: FastifyRequest<{
    Body: { role: coreType.role };
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {

  const { id } = request.params;
  const { role } = request.body;

  // Check if user exists
  const userRecord = await user.findByPk(id);
  if (!userRecord) {
    return reply.status(404).send({ 
      error: "User not found",
      message: "The specified user does not exist"
    });
  }

  // Check if role is already assigned
  const existingPermission = await permission.findOne({
    where: {
      userId: id,
      body: role,
    },
  });

  if (existingPermission) {
    return reply.status(409).send({ 
      error: "Role already assigned",
      message: "This role is already assigned to the user"
    });
  }

  // Create new permission record
  await permission.create({
    userId: id,
    body: role,
  });

  reply.send({ 
    message: "Role has been assigned successfully"
  }).code(200);
};
