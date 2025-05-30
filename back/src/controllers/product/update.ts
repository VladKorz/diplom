import { FastifyReply, FastifyRequest } from 'fastify';

import product from '../../models/db/product';
import * as coreType from '../../types/core';
import hasPermission from '../../utils/hasPermission';

export const patchById = async (
  request: FastifyRequest<{
    Body: coreType.productUpdateBasicInfo;
    Params: coreType.id;
  }>,
  reply: FastifyReply,
) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.product_edit) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to edit products"
    });
  } 
  
  const { name, description, price } = request.body;
  const { id } = request.params;

  // Check if product exists
  const existingProduct = await product.findByPk(id);
  if (!existingProduct) {
    return reply.status(404).send({ 
      error: "Product not found",
      message: "The specified product does not exist"
    });
  }

  const productInfo: coreType.productUpdateBasicInfo = {
    name: name?.trim(),
    description: description?.trim(),
    price: price
  };

  await product.update(productInfo, { where: { id: id } });
  const updatedProduct = await product.findByPk(id);

  reply.send({ 
    message: "Product updated successfully",
    product: updatedProduct
  }).code(200);
};
