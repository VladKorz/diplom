import { FastifySchema } from 'fastify';

export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      name: { type: 'string' },
      surname: { type: 'string' },
      phoneNumber: { type: 'string' },
    },
    required: ['email', 'name', 'surname', 'phoneNumber' ],
  },
};

export const updateValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      name: { type: 'string' },
      surname: { type: 'string' },
      phoneNumber: { type: 'string' },

    },
  },
};