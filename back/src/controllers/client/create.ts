import { FastifyReply, FastifyRequest } from 'fastify';

import clientDbModel from '../../models/db/client';
import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const create = async (request: FastifyRequest< { Body: coreType.clientBasicInfo } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.client_create) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to create clients"
    });
  } 
  const { name, email, surname, phoneNumber } = request.body;

  // Check if a user with this email already exists
  const existingUser = await clientDbModel.findOne({
    where: { email: email.trim() }
  });

  if (existingUser) {
    return reply.status(409).send({
      error: "Email already exists",
      message: "A user with this email already exists"
    });
  }

  const client: dbType.clientDbRecordCreationAttributes = {
    email: email.trim(),
    name: name.trim(),
    surname: surname.trim(),
    phoneNumber: phoneNumber.trim()
  };

  await clientDbModel.create(client);

  const clientReply: coreType.clientBasicInfo = {
    phoneNumber: client.phoneNumber,
    email: client.email,
    name: client.name,
    surname: client.surname
  };

  reply.send({ 
    message: "Client created successfully",
    client: clientReply 
  }).code(201);
};
