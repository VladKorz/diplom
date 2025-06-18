import { FastifyReply, FastifyRequest } from 'fastify';
import { Op } from 'sequelize';

import * as coreType from '../../types/core';
import booking from '../../models/db/booking';
import hasPermission from '../../utils/hasPermission';

export const getByDateRange = async (
  request: FastifyRequest<{
    Body: {
      startDate: string;
      endDate: string;
    };
  }>,
  reply: FastifyReply
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view bookings"
    });
  }

  const { startDate, endDate } = request.body;

  try {
    const bookings = await booking.findAll({
      where: {
        [Op.or]: [
          // Bookings that start within the range
          {
            arrivalDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          // Bookings that end within the range
          {
            departureDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          // Bookings that span the entire range
          {
            [Op.and]: [
              { arrivalDate: { [Op.lte]: startDate } },
              { departureDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      },
      order: [['arrivalDate', 'ASC']]
    });

    reply.send({
      message: "Bookings retrieved successfully",
      bookings: bookings
    }).code(200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    reply.status(500).send({
      error: "Database error",
      message: "Failed to retrieve bookings",
      details: errorMessage
    });
  }
}; 