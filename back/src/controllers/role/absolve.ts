import { FastifyReply, FastifyRequest } from 'fastify';
import permission from '../../models/db/permission';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const absolve = async (
  request: FastifyRequest<{
    Body: { role: coreType.role };
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.absolve_role) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to absolve roles"
    });
  }

  const { id } = request.params;
  const { role } = request.body;

  const permissionRecord = await permission.findOne({
    where: {
      userId: id,
      body: role,
    },
  });

  if (!permissionRecord) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Permission record not found"
    });
  }

  await permissionRecord.destroy();

  reply.send({ 
    message: "Role has been absolved successfully"
  }).code(200);
};
