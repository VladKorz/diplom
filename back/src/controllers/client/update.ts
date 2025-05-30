import { FastifyReply, FastifyRequest } from 'fastify';

import client from '../../models/db/client';

import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.clientUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.client_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit clients"
    });
  } 
  const { name, surname, email, phoneNumber } = request.body;
  const { id } = request.params;

  const clientInfo: coreType.clientUpdateBasicInfo = {
    email: email,
    name: name,
    surname: surname,
    phoneNumber: phoneNumber
  };

  const r = await client.update(clientInfo, { where: { id: id } });

  reply.send({ message: 'client was successfully updated' }).code(200);
};
