import { FastifyReply, FastifyRequest } from 'fastify';
import { Op } from 'sequelize';

import booking from '../models/db/booking';
import object from '../models/db/object';
import * as coreType from '../types/core';
import hasPermission from '../utils/hasPermission';
import payment from '../models/db/payment';
import db from '../repository';

export const payForRent = async (request: FastifyRequest < { Body: coreType.payForRentRequest } >, reply: FastifyReply) => {
    const userToken: coreType.userBasicInfo & coreType.id = request.user;
    
    if (await hasPermission(userToken.id, coreType.role.payment_create) === false) {
        return reply.status(403).send({ 
            error: "Permission denied",
            message: "You don't have permission to pay for rent"
        });
    }

    const { objectId, bookingId, amount } = request.body as coreType.payForRentRequest;

    const bookingRecord = await booking.findOne({
        where: {
            id: bookingId,
            objectId: objectId
        }
    });

    if (!bookingRecord) {
        return reply.status(404).send({ 
            error: "Booking not found",
            message: "No booking found for the specified object and booking ID"
        });
    }

    const bookingData = bookingRecord.get();
    if (bookingData.isPaid) {
        return reply.status(409).send({ 
            error: "Already paid",
            message: "This booking has already been paid"
        });
    }

    if (bookingData.status === 'cancelled') {
        return reply.status(409).send({ 
            error: "Booking cancelled",
            message: "Cannot pay for a cancelled booking"
        });
    }

    // Check if payment amount matches the booking's generalPaymentAmount
    if (amount !== bookingData.generalPaymentAmount) {
        return reply.status(400).send({
            error: "Invalid payment amount",
            message: `Payment amount (${amount}) does not match the required amount (${bookingData.generalPaymentAmount})`
        });
    }

    try {
        let createdPayment;
        await db.transaction(async (t) => {
            // Update booking status to 'paid' and set isPaid to true
            await bookingRecord.update({ 
                status: 'paid',
                isPaid: true 
            }, { transaction: t });

            // Create payment record
            createdPayment = await payment.create({
                bookingId,
                amount,
                date: new Date(),
                description: `Payment for booking #${bookingId}`
            }, { transaction: t });
        });

        // Fetch updated booking record
        const updatedBooking = await booking.findByPk(bookingId);

        reply.send({ 
            message: "Rent payment successful",
            booking: updatedBooking,
            payment: createdPayment
        }).code(200);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        reply.status(500).send({
            error: "Database error",
            message: "Failed to process payment",
            details: errorMessage
        });
    }
};

export const getFreeForRentByDate = async (request: FastifyRequest < { Body: coreType.arrivalDate & coreType.departureDate } >, reply: FastifyReply) => {
    const userToken: coreType.userBasicInfo & coreType.id = request.user;
    
    if (await hasPermission(userToken.id, coreType.role.rent_object_view) === false) {
        return reply.status(403).send({ 
            error: "Permission denied",
            message: "You don't have permission to view rent status"
        });
    }

    const { arrivalDate, departureDate } = request.body;

    // Validate dates
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const now = new Date();


    if (arrival >= departure) {
        return reply.status(400).send({
            error: "Invalid date range",
            message: "Arrival date must be before departure date"
        });
    }

    try {
        // Get all objects
        const allObjects = await object.findAll();
        
        // Get all bookings that overlap with the requested period
        // Exclude cancelled bookings from the check
        const overlappingBookings = await booking.findAll({
            where: {
                status: {
                    [Op.ne]: 'cancelled' // Exclude cancelled bookings
                },
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

        // Get IDs of objects that are booked during the requested period
        const bookedObjectIds = new Set(overlappingBookings.map(booking => booking.get().objectId));

        // Filter out booked objects to get available ones
        const availableObjects = allObjects.filter(obj => !bookedObjectIds.has(obj.get().id));

        reply.send({
            message: "Available objects retrieved successfully",
            availableObjects: availableObjects.map(obj => ({
                id: obj.get().id,
                name: obj.get().name,
                description: obj.get().description,
                costPerHour: obj.get().costPerHour
            }))
        }).code(200);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        reply.status(500).send({
            error: "Database error",
            message: "Failed to retrieve available objects",
            details: errorMessage
        });
    }
};

export const getRentStatusByDate = async (request: FastifyRequest < { Body: coreType.arrivalDate & coreType.departureDate } >, reply: FastifyReply) => {
    const userToken: coreType.userBasicInfo & coreType.id = request.user;
    
    if (await hasPermission(userToken.id, coreType.role.rent_object_view) === false) {
        return reply.status(403).send({ 
            error: "Permission denied",
            message: "You don't have permission to view rent status"
        });
    }

    const { arrivalDate, departureDate } = request.body;

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
        // Get all objects
        const allObjects = await object.findAll();
        
        // Get all bookings that overlap with the requested period
        const overlappingBookings = await booking.findAll({
            where: {
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

        // Create a map of object IDs to their booking status
        const objectStatus = new Map();
        allObjects.forEach(obj => {
            objectStatus.set(obj.get().id, {
                id: obj.get().id,
                name: obj.get().name,
                description: obj.get().description,
                costPerHour: obj.get().costPerHour,
                isAvailable: true,
                conflictingBookings: []
            });
        });

        // Update status for objects with overlapping bookings
        overlappingBookings.forEach(booking => {
            const bookingData = booking.get();
            const objectId = bookingData.objectId;
            const status = objectStatus.get(objectId);
            if (status) {
                // Only mark as unavailable if the booking is not cancelled
                if (bookingData.status !== 'cancelled') {
                    status.isAvailable = false;
                }
                status.conflictingBookings.push({
                    bookingId: bookingData.id,
                    arrivalDate: bookingData.arrivalDate,
                    departureDate: bookingData.departureDate,
                    status: bookingData.status,
                    isPaid: bookingData.isPaid
                });
            }
        });

        reply.send({
            message: "Rent status retrieved successfully",
            objects: Array.from(objectStatus.values())
        }).code(200);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        reply.status(500).send({
            error: "Database error",
            message: "Failed to retrieve rent status",
            details: errorMessage
        });
    }
};
