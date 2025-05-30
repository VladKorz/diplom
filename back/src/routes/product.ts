import { FastifyInstance } from 'fastify';

import {
  createValidationSchema,
  updateValidationSchema,
  createOrderSchema,
  payForOrderSchema,
  getAllProductsSchema,
  getProductSchema,
  cancelOrderSchema,
  getProductBookingOrdersSchema,
  getBookingProductOrdersSchema,
  updateOrderStatusSchema
} from '../models/validation/product';

import { create } from '../controllers/product/create';
import { patchById } from '../controllers/product/update';
import { remove } from '../controllers/product/delete';
import { getAll, getById } from '../controllers/product/get';
import { orderProduct } from '../controllers/product/order';
import { payForProduct } from '../controllers/product/pay';
import { cancelOrder } from '../controllers/product/cancel';
import { getProductBookingOrders } from '../controllers/product/getProductBookingOrders';
import { getBookingProductOrders } from '../controllers/product/getBookingProductOrders';
import { updateOrderStatus } from '../controllers/product/updateStatus';

import * as coreType from '../types/core';

const route = async (fastify: FastifyInstance) => {
  // Basic CRUD operations
  fastify.get<{ Querystring: { page?: number; limit?: number } }>(
    '/all',
    { 
      preHandler: fastify.authenticate,
      schema: getAllProductsSchema
    },
    getAll
  );

  fastify.get<{ Params: coreType.id }>(
    '/:id',
    { 
      preHandler: fastify.authenticate,
      schema: getProductSchema
    },
    getById
  );

  fastify.post<{ Body: coreType.productBasicInfo }>(
    '/',
    { preHandler: fastify.authenticate, schema: createValidationSchema },
    create,
  );

  fastify.patch<{ Body: coreType.productUpdateBasicInfo; Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: updateValidationSchema },
    patchById,
  );

  fastify.delete<{ Params: coreType.id }>(
    '/:id',
    { preHandler: fastify.authenticate, schema: getProductSchema },
    remove
  );

  // Product orders
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
      schema: getProductBookingOrdersSchema 
    },
    getProductBookingOrders
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
      schema: getBookingProductOrdersSchema 
    },
    getBookingProductOrders
  );

  // Order operations
  fastify.post<{ Body: coreType.productId & coreType.bookingId }>(
    '/order',
    { 
      preHandler: fastify.authenticate, 
      schema: createOrderSchema 
    },
    orderProduct
  );

  fastify.post<{ 
    Body: coreType.productId & coreType.bookingId & coreType.amount;
    Params: coreType.id;
  }>(
    '/order/:id/pay',
    { 
      preHandler: fastify.authenticate,
      schema: payForOrderSchema 
    },
    payForProduct
  );

  fastify.post<{ 
    Body: coreType.productId & coreType.bookingId;
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
    Body: coreType.productId & coreType.bookingId & { status: 'pending' | 'done' | 'cancelled' };
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
