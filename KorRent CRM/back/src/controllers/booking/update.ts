import { FastifyReply, FastifyRequest } from 'fastify';

import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

const MAX_BOOKING_DURATION_DAYS = 30; // Maximum booking duration in days

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.bookingUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {  
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit bookings"
    });
  } 

  const { arrivalDate, departureDate, status, isPaid } = request.body;
  const { id } = request.params;

  // Check if booking exists
  const existingBooking = await booking.findByPk(id);
  if (!existingBooking) {
    return reply.status(404).send({ 
      error: "Booking not found",
      message: "The specified booking does not exist"
    });
  }

  // Validate dates if both are provided
  if (arrivalDate && departureDate) {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const now = new Date();
    
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      return reply.status(400).send({
        error: "Invalid date format",
        message: "Arrival and departure dates must be valid dates"
      });
    }

    // Check if dates are in the past
    if (arrival < now) {
      return reply.status(400).send({
        error: "Invalid date",
        message: "Arrival date cannot be in the past"
      });
    }

    if (arrival >= departure) {
      return reply.status(400).send({
        error: "Invalid date range",
        message: "Arrival date must be before departure date"
      });
    }

    // Check maximum booking duration
    const durationInDays = (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24);
    if (durationInDays > MAX_BOOKING_DURATION_DAYS) {
      return reply.status(400).send({
        error: "Invalid booking duration",
        message: `Booking duration cannot exceed ${MAX_BOOKING_DURATION_DAYS} days`
      });
    }
  }

  const bookingInfo: coreType.bookingUpdateBasicInfo = {
    ...(arrivalDate && { arrivalDate }),
    ...(departureDate && { departureDate }),
    status: status,
    isPaid: isPaid,
  };

  await booking.update(bookingInfo, { where: { id: id } });

  reply.send({ 
    message: "Booking was successfully updated",
    booking: {
      id,
      ...bookingInfo
    }
  }).code(200);
};
