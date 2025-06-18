import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
  createOrderSchema,
  payForOrderSchema,
  getAllServicesSchema,
  getServiceSchema,
  cancelOrderSchema,
  getServiceBookingOrdersSchema,
  getBookingServiceOrdersSchema,
  updateOrderStatusSchema
} from '../models/validation/service';

import { create } from '../controllers/service/create';
import { patchById } from '../controllers/service/update';
import { remove } from '../controllers/service/delete';
import { getAll, getById } from '../controllers/service/get';
import { orderService } from '../controllers/service/order';
import { payForService } from '../controllers/service/pay';
import { cancelOrder } from '../controllers/service/cancel';
import { getServiceBookingOrders } from '../controllers/service/getServiceBookingOrders';
import { getBookingServiceOrders } from '../controllers/service/getBookingServiceOrders';
import { updateOrderStatus } from '../controllers/service/updateStatus';

import * as coreType from '../types/core';

const route = async (fastify: FastifyInstance) => {
  // Basic CRUD operations
  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    '/all',
    { 
      preHandler: fastify.authenticate,
      schema: getAllServicesSchema
    },
    getAll
  );

  fastify.get<{ Params: coreType.id }>(
    '/:id',
    { 
      preHandler: fastify.authenticate,
      schema: getServiceSchema
    },
    getById
  );

  fastify.post<{ Body: coreType.serviceBasicInfo }>(
    '/',
    { preHandler: fastify.authenticate, schema: createValidationSchema },
    create,
  );

  fastify.patch<{ Body: coreType.serviceUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    patchById,
  );

  fastify.delete<{ Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: getServiceSchema },
    remove
  );

  // Service orders
  fastify.get<{ 
    Params: coreType.id;
    Querystring: { 
      page?: number; 
      limit?: number;
      status?: 'pending' | 'done' | 'cancelled';
      isPaid?: boolean;
    };
  }>(
    '/:id/orders',
    { 
      preHandler: fastify.authenticate, 
      schema: getServiceBookingOrdersSchema 
    },
    getServiceBookingOrders
  );

  // Booking orders
  fastify.get<{ 
    Params: coreType.id;
    Querystring: { 
      page?: number; 
      limit?: number;
      status?: 'pending' | 'done' | 'cancelled';
      isPaid?: boolean;
    };
  }>(
    '/booking/:id/orders',
    { 
      preHandler: fastify.authenticate, 
      schema: getBookingServiceOrdersSchema 
    },
    getBookingServiceOrders
  );

  // Order operations
  fastify.post<{ Body: coreType.serviceId & coreType.bookingId }>(
    '/order',
    { 
      preHandler: fastify.authenticate, 
      schema: createOrderSchema 
    },
    orderService
  );

  fastify.post<{ 
    Body: coreType.serviceId & coreType.bookingId & coreType.amount;
    Params: coreType.id;
  }>(
    '/order/:id/pay',
    { 
      preHandler: fastify.authenticate,
      schema: payForOrderSchema 
    },
    payForService
  );

  fastify.post<{ 
    Body: coreType.serviceId & coreType.bookingId;
    Params: coreType.id;
  }>(
    '/order/:id/cancel',
    { 
      preHandler: fastify.authenticate, 
      schema: cancelOrderSchema 
    },
    cancelOrder
  );

  fastify.patch<{ 
    Body: coreType.serviceId & coreType.bookingId & { status: 'pending' | 'done' | 'cancelled' };
    Params: coreType.id;
  }>(
    '/order/:id/status',
    { 
      preHandler: fastify.authenticate,
      schema: updateOrderStatusSchema 
    },
    updateOrderStatus
  );
};

export default route; 