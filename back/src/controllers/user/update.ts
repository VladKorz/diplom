import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';

import user from '../../models/db/user';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.userUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.user_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit user"
    });
  }

  const { id } = request.params;
  const { name, email, surname, phoneNumber } = request.body;


  if (userToken.id != id) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit other users"
    });
  }

  const userRecord = await user.findByPk(id);
  if (!userRecord) {
    return reply.status(404).send({
      error: "Not found",
      message: "User not found"
    });
  }

  const updateData: coreType.userUpdateBasicInfo = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.trim();
  if (surname) updateData.surname = surname.trim();
  if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

  await user.update(updateData, { where: { id } });

  reply.send({ 
    message: "User updated successfully"
  }).code(200);
};

export const patchPassowrdById = async (
  request: FastifyRequest<{ Body: coreType.userPassword; Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.user_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit user"
    });
  }
  
  const { id } = request.params;
  const { password } = request.body;


  if (userToken.id != id) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit other users"
    });
  }

  const userRecord = await user.findByPk(id);
  if (!userRecord) {
    return reply.status(404).send({
      error: "Not found",
      message: "User not found"
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await user.update({ passwordHash }, { where: { id } });

  reply.send({ 
    message: "User password updated successfully"
  }).code(200);
};
