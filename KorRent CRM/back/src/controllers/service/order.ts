import { FastifyReply, FastifyRequest } from 'fastify';

import service from '../../models/db/service';
import booking from '../../models/db/booking';
import orderServiceModel from '../../models/db/orderService';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const orderService = async (
  request: FastifyRequest<{ Body: coreType.serviceId & coreType.bookingId }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_service) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to order services"
    });
  }

  const { serviceId, bookingId } = request.body;

  // Check if service exists
  const existingService = await service.findByPk(serviceId);
  if (!existingService) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Service not found"
    });
  }

  // Check if booking exists
  const existingBooking = await booking.findByPk(bookingId);
  if (!existingBooking) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Booking not found"
    });
  }

  // Create order service record
  const orderServiceRecord: dbType.orderServiceDbRecordCreationAttributes = {
    serviceId,
    bookingId,
    isPaid: false,
    status: 'pending',
    price: existingService.getDataValue('price')
  };

  const order = await orderServiceModel.create(orderServiceRecord);

  reply.send({ 
    message: "Service was successfully ordered",
    order: {
      id: order.getDataValue('id'),
      serviceId: order.getDataValue('serviceId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      status: order.getDataValue('status'),
      price: order.getDataValue('price')
    }
  }).code(201);
}; 