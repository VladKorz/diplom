import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import user from '../../models/db/user';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const tokenUser: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(tokenUser.id, coreType.role.read_all_users) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view users"
    });
  } 
  
  const users = await user.findAll();
  const usersReply: coreType.userBasicInfo[] = [];

  for(let i = 0; i < users.length; i += 1) {
    const tmp: coreType.id & coreType.userBasicInfo = {
      id: users[i].getDataValue('id'),
      email: users[i].getDataValue('email'),
      name: users[i].getDataValue('name'),
      surname: users[i].getDataValue('surname'),
      phoneNumber: users[i].getDataValue('phoneNumber')
    };
    usersReply.push(tmp);
  }

  reply.send({ 
    message: "Users retrieved successfully",
    users: usersReply
  }).code(200);
};

export const getById = async (request: FastifyRequest < { Params: coreType.id } >, reply: FastifyReply) => {
  const { id } = request.params as coreType.id;
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.user_view) === false) {  
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view users"
    });
  }

  const userRecord = await user.findByPk(id); 
  if (!userRecord) {
    return reply.status(404).send({ 
      error: "User not found",
      message: "The specified user does not exist"
    });
  }

  const userReply: coreType.id & coreType.userBasicInfo = {
    id: userRecord.getDataValue('id'),
    email: userRecord.getDataValue('email'),
    name: userRecord.getDataValue('name'),
    surname: userRecord.getDataValue('surname'),
    phoneNumber: userRecord.getDataValue('phoneNumber')
  }

  reply.send({ 
    message: "User retrieved successfully",
    user: userReply 
  }).code(200);
};
