import { FastifyReply, FastifyRequest } from 'fastify';

import orderServiceModel from '../../models/db/orderService';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const cancelOrder = async (
  request: FastifyRequest<{ 
    Params: coreType.id;
    Body: coreType.serviceId & coreType.bookingId;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.disorder_service) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to cancel service orders"
    });
  }

  const { id: orderId } = request.params;
  const { serviceId, bookingId } = request.body;

  // Check if order exists
  const existingOrder = await orderServiceModel.findByPk(orderId);
  if (!existingOrder) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Service order not found"
    });
  }

  // Verify that the order matches the provided serviceId and bookingId
  if (existingOrder.getDataValue('serviceId') !== serviceId || 
      existingOrder.getDataValue('bookingId') !== bookingId) {
    return reply.status(400).send({ 
      error: "Invalid input",
      message: "Order does not match provided service and booking"
    });
  }

  // Check if order is already paid
  if (existingOrder.getDataValue('isPaid')) {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Cannot cancel a paid order"
    });
  }

  // Check if order is already cancelled
  if (existingOrder.getDataValue('status') === 'cancelled') {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Order is already cancelled"
    });
  }

  // Update order status to cancelled
  await existingOrder.update({
    status: 'cancelled'
  });

  reply.send({ 
    message: "Service order cancelled successfully",
    order: {
      id: existingOrder.getDataValue('id'),
      serviceId: existingOrder.getDataValue('serviceId'),
      bookingId: existingOrder.getDataValue('bookingId'),
      isPaid: existingOrder.getDataValue('isPaid'),
      status: 'cancelled',
      price: existingOrder.getDataValue('price')
    }
  }).code(200);
}; 