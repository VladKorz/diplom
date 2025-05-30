import { FastifyReply, FastifyRequest } from 'fastify';

import orderServiceModel from '../../models/db/orderService';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const updateOrderStatus = async (
  request: FastifyRequest<{ 
    Body: coreType.serviceId & coreType.bookingId & { status: 'pending' | 'done' | 'cancelled' };
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_service_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to update service order status"
    });
  }

  const { id: orderId } = request.params;
  const { serviceId, bookingId, status } = request.body;

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
      message: "Service order does not match provided service and booking"
    });
  }

  // Check if order is already cancelled
  if (existingOrder.getDataValue('status') === 'cancelled') {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Cannot update status of a cancelled service order"
    });
  }

  // Update order status
  await existingOrder.update({
    status
  });

  reply.send({ 
    message: "Service order status updated successfully",
    order: {
      id: existingOrder.getDataValue('id'),
      serviceId: existingOrder.getDataValue('serviceId'),
      bookingId: existingOrder.getDataValue('bookingId'),
      isPaid: existingOrder.getDataValue('isPaid'),
      status,
      price: existingOrder.getDataValue('price')
    }
  }).code(200);
}; 