import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import service from '../../models/db/service';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.service_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view services"
    });
  }

  const page = request.query.page || 1;
  const limit = request.query.limit || 10;
  const offset = (page - 1) * limit;

  const { count, rows: services } = await service.findAndCountAll({
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  reply.send({ 
    message: "Services retrieved successfully",
    services,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }).code(200);
};

export const getById = async (request: FastifyRequest < { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.service_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view services"
    });
  }

  const { id } = request.params;

  const serviceRecord = await service.findByPk(id);
  if (!serviceRecord) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Service not found"
    });
  }

  reply.send({ 
    message: "Service retrieved successfully",
    service: serviceRecord
  }).code(200);
}; 