import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import client from '../../models/db/client';
import hasPermission from '../../utils/hasPermission';


export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.client_view) === false) {
    return reply.status(400).send({ message: "Permission denied"});
  } 
  const clients = await client.findAll();

  reply.send({ client: clients }).code(200);
};

export const getById = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.client_view) === false) {
    return reply.status(400).send({ message: "Permission denied"});
  } 
  const { id } = request.params;

  const c = await client.findByPk(id);
  if (!c) {
    return reply.status(404).send({ message: 'not found' });
  }

  reply.send({ message: 'Found', client: c }).code(200);
};
