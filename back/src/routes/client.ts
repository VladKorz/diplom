import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
} from '../models/validation/client';

import { create } from '../controllers/client/create';
import { patchById } from '../controllers/client/update';

import * as coreType from '../types/core';
import { deleteById } from '../controllers/client/delete';
import { getAll, getById } from '../controllers/client/get';

const route = async (fastify: FastifyInstance) => {
  fastify.get('/all', { preHandler: fastify.authenticate }, getAll);
  fastify.get<{ Params: coreType.id }>('/:id', { preHandler: fastify.authenticate }, getById);

  fastify.post<{ Body: coreType.clientBasicInfo }>(
    '/',
    { preHandler: fastify.authenticate, schema: createValidationSchema },
    create,
  );

  fastify.patch<{ Body: coreType.clientUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    patchById,
  );

  fastify.delete<{ Params: coreType.id }>('/delete/:id', { preHandler: fastify.authenticate }, deleteById);
};

export default route;