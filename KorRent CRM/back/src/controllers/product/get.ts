import { FastifyReply, FastifyRequest } from 'fastify';

import * as coreType from '../../types/core';
import product from '../../models/db/product';
import hasPermission from '../../utils/hasPermission';

export const getAll = async (request: FastifyRequest<{ Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;

  if (await hasPermission(userToken.id, coreType.role.product_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view products"
    });
  }

  const page = request.query.page || 1;
  const limit = request.query.limit || 10;
  const offset = (page - 1) * limit;

  const { count, rows: products } = await product.findAndCountAll({
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  reply.send({ 
    message: "Products retrieved successfully",
    products,
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
  
  if (await hasPermission(userToken.id, coreType.role.product_view) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to view products"
    });
  }

  const { id } = request.params;

  const productRecord = await product.findByPk(id);
  if (!productRecord) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Product not found"
    });
  }

  reply.send({ 
    message: "Product retrieved successfully",
    product: productRecord
  }).code(200);
};


