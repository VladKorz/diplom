import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import booking from '../../models/db/booking';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view bookings"
    });
  } 
  
  const bookings = await booking.findAll();

  reply.send({ 
    message: "Bookings retrieved successfully",
    bookings: bookings 
  }).code(200);
};

export const getById = async (request: FastifyRequest < { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view bookings"
    });
  } 
  const { id } = request.params as coreType.id;

  const bookingRecord = await booking.findByPk(id);
  if (!bookingRecord) {
    return reply.status(404).send({ 
      error: "Booking not found",
      message: "The specified booking does not exist"
    });
  }

  reply.send({ 
    message: "Booking retrieved successfully",
    booking: bookingRecord
  }).code(200);
};
