import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';

import userDbModel from '../../models/db/user';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const create = async (request: FastifyRequest< { Body: coreType.userCreateRequest } >, reply: FastifyReply) => {

  const { name, email, surname, phoneNumber, password } = request.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user: dbType.userDbRecordCreationAttributes = {
    email: email.trim(),
    name: name.trim(),
    surname: surname.trim(),
    phoneNumber: phoneNumber?.trim(),
    passwordHash
  };

  await userDbModel.create(user);

  const userReply: coreType.userBasicInfo = {
    email: user.email,
    name: user.name,
    surname: user.surname,
    phoneNumber: user.phoneNumber
  };

  reply.send({ 
    message: "User created successfully",
    user: userReply
  }).code(201);
};
