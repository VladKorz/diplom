import { FastifyReply, FastifyRequest } from 'fastify';

import orderServiceModel from '../../models/db/orderService';
import service from '../../models/db/service';
import booking from '../../models/db/booking';

import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const getOrderedServices = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_view_service) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view ordered services"
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

  // Get all ordered services for the booking
  const orderedServices = await orderServiceModel.findAll({
    where: { bookingId },
    include: [{
      model: service,
      attributes: ['id', 'name', 'description', 'price']
    }]
  });

  reply.send({ 
    message: 'Ordered services retrieved successfully',
    orderedServices: orderedServices.map(order => ({
      id: order.getDataValue('id'),
      serviceId: order.getDataValue('serviceId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      service: order.get('service')
    }))
  }).code(200);
}; 