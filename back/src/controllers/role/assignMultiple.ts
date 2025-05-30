import { FastifyReply, FastifyRequest } from 'fastify';

import hasPermission from '../../utils/hasPermission';
import user from '../../models/db/user';
import permission from '../../models/db/permission';
import * as coreType from '../../types/core';
import * as dbType from '../../types/db';

export const assignMultiple = async (
  request: FastifyRequest<{
    Body: { roles: coreType.role[] };
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  // if (await hasPermission(userToken.id, coreType.role.assign_role) === false) {
  //   return reply.status(403).send({ 
  //     error: "Permission denied",
  //     message: "You don't have permission to assign roles"
  //   });
  // }

  const { id } = request.params;
  const { roles } = request.body;

  // Check if user exists
  const userRecord = await user.findByPk(id);
  if (!userRecord) {
    return reply.status(404).send({ 
      error: "User not found",
      message: "The specified user does not exist"
    });
  }

  // Get existing permissions for the user
  const existingPermissions = await permission.findAll({
    where: {
      userId: id,
      body: roles,
    },
  });

  const existingRoles = existingPermissions.map(p => p.get('body') as coreType.role);
  const newRoles = roles.filter(role => !existingRoles.includes(role));

  if (newRoles.length === 0) {
    return reply.status(409).send({ 
      error: "Roles already assigned",
      message: "All specified roles are already assigned to the user"
    });
  }

  // Create new permission records for each new role
  await Promise.all(
    newRoles.map(role =>
      permission.create({
        userId: id,
        body: role,
      })
    )
  );

  reply.send({ 
    message: "Roles have been assigned successfully",
    assignedRoles: newRoles,
    alreadyAssignedRoles: existingRoles
  }).code(200);
}; 