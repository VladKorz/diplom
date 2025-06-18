import { FastifyReply, FastifyRequest } from 'fastify';

import orderServiceModel from '../../models/db/orderService';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const payForService = async (
  request: FastifyRequest<{ 
    Body: coreType.serviceId & coreType.bookingId & coreType.amount;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_service) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to pay for services"
    });
  }

  const { id: orderId } = request.params;
  const { amount, serviceId, bookingId } = request.body;

  // Check if order exists
  const existingOrder = await orderServiceModel.findByPk(orderId);
  if (!existingOrder) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Order not found"
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
      message: "Order is already paid"
    });
  }

  // Check if order is cancelled
  if (existingOrder.getDataValue('status') === 'cancelled') {
    return reply.status(409).send({ 
      error: "Conflict",
      message: "Cannot pay for a cancelled order"
    });
  }

  // Verify payment amount matches order price
  const orderPrice = existingOrder.getDataValue('price');
  if (amount !== orderPrice) {
    return reply.status(400).send({ 
      error: "Invalid amount",
      message: `Payment amount (${amount}) does not match order price (${orderPrice})`
    });
  }

  // Update order payment status
  await existingOrder.update({
    isPaid: true,
    status: 'done'
  });

  reply.send({ 
    message: "Service payment successful",
    order: {
      id: existingOrder.getDataValue('id'),
      serviceId: existingOrder.getDataValue('serviceId'),
      bookingId: existingOrder.getDataValue('bookingId'),
      isPaid: true,
      status: 'done',
      price: orderPrice
    }
  }).code(200);
}; 