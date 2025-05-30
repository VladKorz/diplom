import { FastifySchema } from 'fastify';

export const getAllValidationSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { 
        type: 'number',
        minimum: 1,
        default: 1
      },
      limit: { 
        type: 'number',
        minimum: 1,
        maximum: 100,
        default: 10
      }
    }
  }
};

export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      date: { 
        type: 'string',
        format: 'date-time'
      },
      amount: { 
        type: 'number',
        minimum: 0
      },
      bookingId: {
        type: 'number',
        minimum: 1
      }
    },
    required: ['date', 'amount'],
  },
};

export const updateValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      date: { 
        type: 'string',
        format: 'date-time'
      },
      amount: { 
        type: 'number',
        minimum: 0
      }
    },
  },
};
