import { FastifyReply, FastifyRequest } from 'fastify';
import { Op, Transaction } from 'sequelize';

import booking from '../../models/db/booking';
import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';
import object from '../../models/db/object';
import client from '../../models/db/client';
import db from '../../repository';

export const create = async (request: FastifyRequest < { Body: coreType.bookingBasicInfo } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.booking_create) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to create bookings"
    });
  } 
  const { arrivalDate, departureDate, clientId, objectId } = request.body;

  const obj = await object.findByPk(objectId);
  if (!obj) {
    return reply.status(400).send({
      error: "Not found",
      message: "Object not found"
    });
  }

  // Check if object is already booked for the requested period
  const existingBookings = await booking.findAll({
    where: {
      objectId: objectId,
      [Op.or]: [
        // Case 1: New booking's arrival date falls within an existing booking
        {
          [Op.and]: [
            { arrivalDate: { [Op.lte]: arrivalDate } },
            { departureDate: { [Op.gt]: arrivalDate } }
          ]
        },
        // Case 2: New booking's departure date falls within an existing booking
        {
          [Op.and]: [
            { arrivalDate: { [Op.lt]: departureDate } },
            { departureDate: { [Op.gte]: departureDate } }
          ]
        },
        // Case 3: New booking completely encompasses an existing booking
        {
          [Op.and]: [
            { arrivalDate: { [Op.gte]: arrivalDate } },
            { departureDate: { [Op.lte]: departureDate } }
          ]
        }
      ]
    }
  });

  if (existingBookings.length > 0) {
    return reply.status(409).send({
      error: "Object unavailable",
      message: "The object is already booked for the requested period",
      conflictingBookings: existingBookings.map(booking => {
        const bookingData = booking.get();
        return {
          bookingId: bookingData.id,
          arrivalDate: bookingData.arrivalDate,
          departureDate: bookingData.departureDate
        };
      })
    });
  }

  const cli = await client.findByPk(clientId);
  if (!cli) {
    return reply.status(400).send({
      error: "Not found",
      message: "Client not found"
    });
  }

  // Validate dates
  const arrival = new Date(arrivalDate);
  const departure = new Date(departureDate);
  const now = new Date();

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

  try {
    // Calculate duration in hours
    const durationInHours = (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60);
    
    // Get cost per hour from the object
    const costPerHour = obj.getDataValue('costPerHour');
    
    // Calculate total payment amount
    const generalPaymentAmount = durationInHours * costPerHour;

    // Create the booking
    const result = await booking.create({
      arrivalDate: arrivalDate,
      clientId: clientId,
      objectId: objectId,
      departureDate: departureDate,
      generalPaymentAmount: generalPaymentAmount,
      status: "pending",
      isPaid: false
    });

    const bookingInfo: coreType.bookingBasicInfo = {
      arrivalDate: result.get().arrivalDate,
      departureDate: result.get().departureDate,
      clientId: clientId,
      objectId: objectId,
      generalPaymentAmount: result.get().generalPaymentAmount,
      status: result.get().status,
      isPaid: result.get().isPaid
    };

    reply.send({ 
      message: "Booking was successfully created", 
      bookingInfo 
    }).code(201);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    reply.status(500).send({
      error: "Database error",
      message: "Failed to create booking",
      details: errorMessage
    });
  }
};
