import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
  cancelValidationSchema,
  getBookingsByDateRangeSchema
} from '../models/validation/booking';

import { create } from '../controllers/booking/create';
import { patchById } from '../controllers/booking/update';
import { cancel } from '../controllers/booking/cancel';
import { getByDateRange } from '../controllers/booking/getByDateRange';

import * as coreType from '../types/core';
import { deleteById } from '../controllers/booking/delete';
import { getAll, getById } from '../controllers/booking/get';

const route = async (fastify: FastifyInstance) => {
  fastify.get('/all', { preHandler: fastify.authenticate }, getAll);
  fastify.get<{ Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate },
    getById,
  );

  fastify.post<{
    Body: coreType.bookingBasicInfo
  }>(
    '/',
    { preHandler: [fastify.authenticate], schema: createValidationSchema },
    create,
  );

  fastify.patch<{ Body: coreType.bookingUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    patchById,
  );

  fastify.delete<{ Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate },
    deleteById,
  );

  fastify.post<{ Params: coreType.id }>(
    '/cancel/:id',
    { preHandler: fastify.authenticate, schema: cancelValidationSchema },
    cancel,
  );

  fastify.post<{
    Body: {
      startDate: string;
      endDate: string;
    };
  }>(
    '/byDateRange',
    { 
      preHandler: fastify.authenticate,
      schema: getBookingsByDateRangeSchema 
    },
    getByDateRange
  );
};

export default route;
