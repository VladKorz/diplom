import { FastifyReply, FastifyRequest } from 'fastify';

import product from '../../models/db/product';
import booking from '../../models/db/booking';
import orderProductModel from '../../models/db/orderProduct';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const orderProduct = async (
  request: FastifyRequest<{ Body: coreType.productId & coreType.bookingId }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.order_products) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to order products"
    });
  }

  const { productId, bookingId } = request.body;

  // Check if product exists
  const existingProduct = await product.findByPk(productId);
  if (!existingProduct) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Product not found"
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

  // Create order product record
  const orderProductRecord: dbType.orderProductDbRecordCreationAttributes = {
    productId,
    bookingId,
    isPaid: false,
    status: 'pending',
    price: existingProduct.getDataValue('price')
  };

  const order = await orderProductModel.create(orderProductRecord);

  reply.send({ 
    message: "Product was successfully ordered",
    order: {
      id: order.getDataValue('id'),
      productId: order.getDataValue('productId'),
      bookingId: order.getDataValue('bookingId'),
      isPaid: order.getDataValue('isPaid'),
      status: order.getDataValue('status'),
      price: order.getDataValue('price')
    }
  }).code(201);
}; 