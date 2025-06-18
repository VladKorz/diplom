import { FastifyReply, FastifyRequest } from 'fastify';

import orderProductModel from '../../models/db/orderProduct';
import product from '../../models/db/product';
import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const getProductBookingOrders = async (
  request: FastifyRequest<{ 
    Params: coreType.id;
    Querystring: { 
      page?: number; 
      limit?: number;
      status?: 'pending' | 'done' | 'cancelled';
      isPaid?: boolean;
    };
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_view_products) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view product orders"
    });
  }

  const { id: productId } = request.params;
  const { page = 1, limit = 10, status, isPaid } = request.query;

  // Check if product exists
  const existingProduct = await product.findByPk(productId);
  if (!existingProduct) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Product not found"
    });
  }

  // Build where clause
  const where: any = { productId };
  if (status) where.status = status;
  if (isPaid !== undefined) where.isPaid = isPaid;

  // Get orders with pagination
  const offset = (page - 1) * limit;
  const { count, rows: orders } = await orderProductModel.findAndCountAll({
    where,
    include: [{
      model: booking,
      attributes: ['id', 'arrivalDate', 'departureDate', 'status']
    }],
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  reply.send({ 
    message: "Product orders retrieved successfully",
    orders: orders.map(order => ({
      id: order.getDataValue('id'),
      productId: order.getDataValue('productId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      status: order.getDataValue('status'),
      price: order.getDataValue('price'),
      booking: order.get('booking')
    })),
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }).code(200);
}; 