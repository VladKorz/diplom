import { FastifyReply, FastifyRequest } from 'fastify';

import orderProductModel from '../../models/db/orderProduct';
import product from '../../models/db/product';
import booking from '../../models/db/booking';

import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const getOrderedProducts = async (
  request: FastifyRequest<{ Params: coreType.id }>,
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

  // Check if booking exists
  const existingBooking = await booking.findByPk(bookingId);
  if (!existingBooking) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Booking not found"
    });
  }

  // Get all ordered products for the booking
  const orderedProducts = await orderProductModel.findAll({
    where: { bookingId },
    include: [{
      model: product,
      attributes: ['id', 'name', 'description', 'price']
    }]
  });

  reply.send({ 
    message: 'Ordered products retrieved successfully',
    orderedProducts: orderedProducts.map(order => ({
      id: order.getDataValue('id'),
      productId: order.getDataValue('productId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      product: order.get('product')
    }))
  }).code(200);
}; 