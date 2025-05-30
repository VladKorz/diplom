import { FastifyReply, FastifyRequest } from 'fastify';

import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const cancel = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_cancel) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to cancel bookings"
    });
  } 

  const { id } = request.params;
  const bookingRecord = await booking.findByPk(id);
  
  if (!bookingRecord) {
    return reply.status(404).send({ 
      error: "Booking not found",
      message: "The specified booking does not exist"
    });
  }

  if (bookingRecord.getDataValue('status') === 'cancelled') {
    return reply.status(409).send({ 
      error: "Already cancelled",
      message: "This booking has already been cancelled"
    });
  }

  await bookingRecord.update({ status: 'cancelled' });

  reply.send({ 
    message: "Booking cancelled successfully",
    booking: bookingRecord
  }).code(200);
}; 