import { FastifyReply, FastifyRequest } from 'fastify';

import orderProductModel from '../../models/db/orderProduct';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const cancelOrder = async (
  request: FastifyRequest<{ 
    Body: coreType.productId & coreType.bookingId;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_products) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to cancel orders"
    });
  }

  const { id: orderId } = request.params;
  const { productId, bookingId } = request.body;

  // Check if order exists
  const existingOrder = await orderProductModel.findByPk(orderId);
  if (!existingOrder) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Order not found"
    });
  }

  // Verify that the order matches the provided productId and bookingId
  if (existingOrder.getDataValue('productId') !== productId || 
      existingOrder.getDataValue('bookingId') !== bookingId) {
    return reply.status(400).send({ 
      error: "Invalid input",
      message: "Order does not match provided product and booking"
    });
  }

  // Check if order is already cancelled
  if (existingOrder.getDataValue('status') === 'cancelled') {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Order is already cancelled"
    });
  }

  // Check if order is already paid
  if (existingOrder.getDataValue('isPaid')) {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Cannot cancel a paid order"
    });
  }

  // Update order status to cancelled
  await existingOrder.update({
    status: 'cancelled'
  });

  reply.send({ 
    message: "Order cancelled successfully",
    order: {
      id: existingOrder.getDataValue('id'),
      productId: existingOrder.getDataValue('productId'),
      bookingId: existingOrder.getDataValue('bookingId'),
      isPaid: existingOrder.getDataValue('isPaid'),
      status: 'cancelled',
      price: existingOrder.getDataValue('price')
    }
  }).code(200);
}; 