import { FastifyReply, FastifyRequest } from 'fastify';

import orderServiceModel from '../../models/db/orderService';
import service from '../../models/db/service';
import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const getServiceBookingOrders = async (
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

  if (await hasPermission(userToken.id, coreType.role.order_view_service) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view service orders"
    });
  }

  const { id: serviceId } = request.params;
  const { page = 1, limit = 10, status, isPaid } = request.query;

  // Check if service exists
  const existingService = await service.findByPk(serviceId);
  if (!existingService) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Service not found"
    });
  }

  // Build where clause
  const where: any = { serviceId };
  if (status) where.status = status;
  if (isPaid !== undefined) where.isPaid = isPaid;

  // Get orders with pagination
  const offset = (page - 1) * limit;
  const { count, rows: orders } = await orderServiceModel.findAndCountAll({
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
    message: "Service orders retrieved successfully",
    orders: orders.map(order => ({
      id: order.getDataValue('id'),
      serviceId: order.getDataValue('serviceId'),
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