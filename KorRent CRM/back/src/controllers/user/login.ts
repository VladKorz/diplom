import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';

import app from '../../server';

import user from '../../models/db/user';

import * as coreType from '../../types/core';

export const login = async (request: FastifyRequest<{ Body: coreType.userBasicInfo & coreType.userPassword }>, reply: FastifyReply) => {
  const { email, password } = request.body;

  const u = await user.findOne({
    where: { email: email.trim() }
  });

  if (!u) {
    return reply.status(401).send({ 
      error: "Authentication failed",
      message: "Invalid email or password"
    });
  }

  const passwordHash = u.getDataValue('passwordHash');
  const passwordMatch = await bcrypt.compare(password, passwordHash);

  if (!passwordMatch) {
    return reply.status(401).send({ 
      error: "Authentication failed",
      message: "Invalid email or password"
    });
  }

  const userPayload: coreType.userBasicInfo & coreType.id = {
    id: u.getDataValue('id'),
    email: u.getDataValue('email'),
    name: u.getDataValue('name'),
    surname: u.getDataValue('surname'),
    phoneNumber: u.getDataValue('phoneNumber')
  };

  const token = app.jwt.sign(userPayload);
  reply.cookie('access_token', token, { 
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  reply.send({ 
    message: "Login successful",
    token,
    user: userPayload
  }).code(200);
};