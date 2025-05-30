import { FastifyInstance } from 'fastify';

import { absolve } from '../controllers/role/absolve';
import { assign } from '../controllers/role/assign';
import { assignMultiple } from '../controllers/role/assignMultiple';

import { assignRoleSchema, assignMultipleRolesSchema } from '../models/validation/role';

import * as coreType from '../types/core'
import * as dbType from '../types/db'

// С разрешениями (permission) мы можем делать только две вещи //
const route = async (fastify: FastifyInstance) => {
  // Снимать разрешение с пользователя //
  fastify.post< { Params: coreType.id, Body: { role: coreType.role } } >('/absolve/:id', { preHandler: fastify.authenticate }, absolve);
  // Назначать разрешение пользователю //
  fastify.post< { Params: coreType.id; Body: { role: coreType.role } } >('/assign/:id', { preHandler: fastify.authenticate, schema: assignRoleSchema }, assign);
  // Назначать несколько разрешений пользователю //
  fastify.post< { Params: coreType.id; Body: { roles: coreType.role[] } } >('/assign-multiple/:id', { preHandler: fastify.authenticate, schema: assignMultipleRolesSchema }, assignMultiple);
};

export default route;
