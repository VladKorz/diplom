import { FastifyReply, FastifyRequest } from 'fastify';

import payment from '../../models/db/payment';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const update = async (request: FastifyRequest< { Body: coreType.paymentUpdateBasicInfo, Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.payment_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit payments"
    });
  }

  const { date, amount, bookingId } = request.body;
  const { id } = request.params;

  // Check if payment exists
  const existingPayment = await payment.findByPk(id);
  if (!existingPayment) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Payment not found"
    });
  }


  const paymentInfo: coreType.paymentUpdateBasicInfo = {
    date: date,
    amount: amount,
    bookingId: bookingId
  };

  await existingPayment.update(paymentInfo);

  reply.send({ 
    message: "Payment updated successfully",
    payment: existingPayment
  }).code(200);
};
