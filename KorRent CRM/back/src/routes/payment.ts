import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
  getAllValidationSchema
} from '../models/validation/payment';

import { update } from '../controllers/payment/update';

import * as coreType from '../types/core';
import { getAll, getById } from '../controllers/payment/get';

const route = async (fastify: FastifyInstance) => {
  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    '/all', 
    { 
      preHandler: fastify.authenticate,
      schema: getAllValidationSchema
    }, 
    getAll
  );
  fastify.get<{ Params: coreType.id }>('/getById/:id', { preHandler: fastify.authenticate }, getById);

  fastify.patch<{ Body: coreType.paymentUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    update,
  );

};

export default route;
