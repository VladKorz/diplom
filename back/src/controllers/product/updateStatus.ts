import { FastifyReply, FastifyRequest } from 'fastify';

import orderProductModel from '../../models/db/orderProduct';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const updateOrderStatus = async (
  request: FastifyRequest<{ 
    Body: coreType.productId & coreType.bookingId & { status: 'pending' | 'done' | 'cancelled' };
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_products_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to update order status"
    });
  }

  const { id: orderId } = request.params;
  const { productId, bookingId, status } = request.body;

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
      message: "Cannot update status of a cancelled order"
    });
  }

  // Update order status
  await existingOrder.update({
    status
  });

  reply.send({ 
    message: "Order status updated successfully",
    order: {
      id: existingOrder.getDataValue('id'),
      productId: existingOrder.getDataValue('productId'),
      bookingId: existingOrder.getDataValue('bookingId'),
      isPaid: existingOrder.getDataValue('isPaid'),
      status,
      price: existingOrder.getDataValue('price')
    }
  }).code(200);
}; 