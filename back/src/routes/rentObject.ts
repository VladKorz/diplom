import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
  rentObjectValidationSchema,
  payForRentValidationSchema,
  getRentStatusByIdValidationSchema,
  getRentStatusByDateValidationSchema,
  getFreeForRentByDateValidationSchema
} from '../models/validation/rentObject';

import { create } from '../controllers/object/create';
import { patchById } from '../controllers/object/update';
import { deleteById } from '../controllers/object/delete';
import { getAll, getById } from '../controllers/object/get';
import {
  payForRent,
  getRentStatusByDate,
  getFreeForRentByDate
} from '../controllers/rentObject';

import * as coreType from '../types/core';

const route = async (fastify: FastifyInstance) => {
  // Basic CRUD operations
  fastify.get('/all', { preHandler: fastify.authenticate }, getAll);
  fastify.get<{ Params: coreType.id }>('/:id', { preHandler: fastify.authenticate }, getById);

  fastify.post<{ Body: coreType.objectBasicInfo }>(
    '/',
    { preHandler: fastify.authenticate, schema: createValidationSchema },
    create,
  );

  fastify.patch<{ Body: coreType.objectUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    patchById,
  );

  fastify.delete<{ Params: coreType.id }>('/delete/:id', { preHandler: fastify.authenticate }, deleteById);

  fastify.post<{ Body: coreType.payForRentRequest }>(
    '/pay',
    { 
      preHandler: fastify.authenticate, 
      schema: payForRentValidationSchema 
    },
    payForRent
  );

  fastify.post<{ Body: coreType.arrivalDate & coreType.departureDate }>(
    '/status_all',
    { 
      preHandler: fastify.authenticate, 
      schema: getRentStatusByDateValidationSchema 
    },
    getRentStatusByDate
  );

  fastify.post<{ Body: coreType.arrivalDate & coreType.departureDate }>(
    '/available',
    { 
      preHandler: fastify.authenticate, 
      schema: getFreeForRentByDateValidationSchema 
    },
    getFreeForRentByDate
  );
};

export default route;
