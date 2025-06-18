import { FastifyInstance } from 'fastify';

import user from './user';
import role from './role';
import client from './client';
import payment from './payment';
import service from './service';
import product from './product';
import booking from './booking';
import rentObject from './rentObject';


const route = async (fastify: FastifyInstance) => {
  fastify.register(user, { prefix: '/user' });
  fastify.register(role, { prefix: '/role' });
  fastify.register(client, { prefix: '/client' });
  fastify.register(service, { prefix: '/service' });
  fastify.register(booking, { prefix: '/booking' });
  fastify.register(rentObject, { prefix: '/rentObject' });

  fastify.register(payment, { prefix: '/payment' });
  fastify.register(product, { prefix: '/product' });
};

export default route;
