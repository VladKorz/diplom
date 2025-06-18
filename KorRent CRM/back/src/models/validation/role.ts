import { FastifySchema } from 'fastify';

import * as coreType from '../../types/core';

export const assignRoleSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: Object.values(coreType.role) },
    },
    required: ['role'],
  },
};

export const assignMultipleRolesSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      roles: { 
        type: 'array',
        items: { type: 'string', enum: Object.values(coreType.role) },
        minItems: 1
      },
    },
    required: ['roles'],
  },
};
