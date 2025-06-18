import { FastifyReply, FastifyRequest } from 'fastify';

import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const deleteById = async (
  request: FastifyRequest<{ Params: coreType.id }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete bookings"
    });
  } 
  const { id } = request.params;
  const b = await booking.findByPk(id);
  if (!b) {
    return reply.status(404).send({ message: "booking not found" });
  }

  await b.destroy();
  reply.send({ message: 'successfully deleted' }).code(200);
};
