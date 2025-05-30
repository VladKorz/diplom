import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updatePasswordValidationSchema,
  updateValidationSchema,
  loginValidationSchema,
} from '../models/validation/user';

import { create } from '../controllers/user/create';
import { patchById, patchPassowrdById } from '../controllers/user/update';
import { deleteById } from '../controllers/user/delete';
import { getAll, getById } from '../controllers/user/get';
import { login } from '../controllers/user/login';

import * as coreType from '../types/core';

const route = async (fastify: FastifyInstance) => {
  // Public routes
  fastify.post('/login', { 
    schema: loginValidationSchema 
  }, login);

  // Protected routes
  fastify.get('/all', { 
    preHandler: fastify.authenticate 
  }, getAll);

  fastify.get<{ Params: coreType.id }>(
    '/:id',
    { 
      preHandler: fastify.authenticate 
    },
    getById
  );

  fastify.post<{ Body: coreType.userCreateRequest }>(
    '/',
    {
      schema: createValidationSchema,
    },
    create
  );

  fastify.patch<{ Body: coreType.userUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    {
      preHandler: fastify.authenticate,
      schema: updateValidationSchema,
    },
    patchById
  );

  fastify.patch<{ Body: coreType.userPassword; Params: coreType.id }>(
    '/:id/password',
    {
      preHandler: fastify.authenticate,
      schema: updatePasswordValidationSchema,
    },
    patchPassowrdById
  );

  fastify.delete<{ Params: coreType.id }>(
    '/:id',
    {
      preHandler: fastify.authenticate
    },
    deleteById
  );
};

export default route;
