import { FastifyReply, FastifyRequest } from 'fastify';

import orderProductModel from '../../models/db/orderProduct';
import product from '../../models/db/product';
import booking from '../../models/db/booking';

import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const getBookingProductOrders = async (
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
      message: "You don't have permission to view ordered products"
    });
  }

  const { id: bookingId } = request.params;
  const { page = 1, limit = 10, status, isPaid } = request.query;

  // Check if booking exists
  const existingBooking = await booking.findByPk(bookingId);
  if (!existingBooking) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Booking not found"
    });
  }

  // Build where clause
  const where: any = { bookingId };
  if (status) where.status = status;
  if (isPaid !== undefined) where.isPaid = isPaid;

  // Get all ordered products for the booking with pagination
  const offset = (page - 1) * limit;
  const { count, rows: orderedProducts } = await orderProductModel.findAndCountAll({
    where: {
      bookingId: bookingId
    },
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  reply.send({ 
    message: 'Ordered products retrieved successfully',
    orderedProducts: orderedProducts.map(order => ({
      id: order.getDataValue('id'),
      productId: order.getDataValue('productId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      status: order.getDataValue('status'),
      price: order.getDataValue('price'),
      product: order.get('product')
    })),
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }).code(200);
}; 