import { FastifyReply, FastifyRequest } from 'fastify';

import product from '../../models/db/product';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const remove = async (request: FastifyRequest< { Params: coreType.id } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.product_delete) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to delete products"
    });
  }

  const { id } = request.params;

  // Check if product exists
  const existingProduct = await product.findByPk(id);
  if (!existingProduct) {
    return reply.status(404).send({ 
      error: "Not found",
      message: "Product not found"
    });
  }

  await existingProduct.destroy();

  reply.send({ 
    message: "Product deleted successfully"
  }).code(200);
};
