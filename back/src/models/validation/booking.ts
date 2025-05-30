import { FastifySchema } from 'fastify';

export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      arrivalDate: { 
        type: 'string',
        format: 'date-time'
      },
      departureDate: { 
        type: 'string',
        format: 'date-time'
      },
      clientId: { 
        type: 'number',
        minimum: 1
      },
      objectId: { 
        type: 'number',
        minimum: 1
      },
      generalPaymentAmount: {
        type: 'number',
        minimum: 0
      }
    },
    required: ['arrivalDate', 'departureDate', 'objectId', 'clientId'],
   },
};

export const updateValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      arrivalDate: { 
        type: 'string',
        format: 'date-time'
      },
      departureDate: { 
        type: 'string',
        format: 'date-time'
      },
      objectId: { 
        type: 'number',
        minimum: 1
      },
      generalPaymentAmount: {
        type: 'number',
        minimum: 0
      }
    },
  },
};

export const cancelValidationSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        minimum: 1
      }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        booking: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            status: { type: 'string' }
          }
        }
      }
    }
  }
};

export const getBookingsByDateRangeSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      startDate: { 
        type: 'string',
        format: 'date-time'
      },
      endDate: { 
        type: 'string',
        format: 'date-time'
      }
    },
    required: ['startDate', 'endDate'],
    additionalProperties: false
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        bookings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              arrivalDate: { type: 'string', format: 'date-time' },
              departureDate: { type: 'string', format: 'date-time' },
              clientId: { type: 'number' },
              objectId: { type: 'number' },
              generalPaymentAmount: { type: 'number' },
              status: { type: 'string' },
              isPaid: { type: 'boolean' }
            }
          }
        }
      }
    }
  }
};