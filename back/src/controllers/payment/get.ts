import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import payment from '../../models/db/payment';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.payment_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view payments"
    });
  }

  const payments = await payment.findAll();

  reply.send({ 
    message: "Payments retrieved successfully",
    payments
  }).code(200);
};

export const getById = async (request: FastifyRequest< { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.payment_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view payments"
    });
  }

  const { id } = request.params;

  const paymentRecord = await payment.findByPk(id);
  if (!paymentRecord) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Payment not found"
    });
  }

  reply.send({ 
    message: "Payment retrieved successfully",
    payment: paymentRecord
  }).code(200);
};
