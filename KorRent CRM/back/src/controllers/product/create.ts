import { FastifyReply, FastifyRequest } from 'fastify';

import product from '../../models/db/product';

import * as coreType from '../../types/core';
import * as dbType from '../../types/db';
import hasPermission from '../../utils/hasPermission';

export const create = async (request: FastifyRequest< { Body: coreType.productBasicInfo } >, reply: FastifyReply) => {
  const userToken: coreType.userBasicInfo & coreType.id = request.user;
  
  if (await hasPermission(userToken.id, coreType.role.product_create) === false) {
    return reply.status(403).send({ 
      error: "Permission denied",
      message: "You don't have permission to create products"
    });
  }

  const { name, description, price } = request.body;
  if (price <= 0) {
    return reply.status(400).send({ 
      error: "Invalid input",
      message: "Product price must be greater than zero"
    });
  }

  const productInfo: dbType.productDbRecordCreationAttributes = {
    name: name.trim(),
    description: description.trim(),
    price: price
  };

  const createdProduct = await product.create(productInfo);

  reply.send({ 
    message: "Product created successfully",
    product: createdProduct
  }).code(201);
};
