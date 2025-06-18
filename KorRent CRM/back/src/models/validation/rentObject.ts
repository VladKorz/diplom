import { FastifySchema } from 'fastify';

export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      costPerHour: { type: 'number', minimum: 0 },
    },
    required: ['description', 'name', 'costPerHour'],
  },
};

export const updateValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      costPerHour: { type: 'number', minimum: 0 },
    },
  },
};

export const rentObjectValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      objectId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      },
      time: { 
        type: 'number',
        minimum: 0
      }
    },
    required: ['objectId', 'bookingId', 'time']
  }
};

export const payForRentValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      objectId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      },
      amount: { 
        type: 'number',
        minimum: 0
      }
    },
    required: ['objectId', 'bookingId', 'amount']
  }
};

export const getRentStatusByIdValidationSchema: FastifySchema = {
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
      }
    },
    required: ['arrivalDate', 'departureDate'],
  }
};

export const getRentStatusByDateValidationSchema: FastifySchema = {
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
      }
    },
    required: ['arrivalDate', 'departureDate'],
  }
};

export const getFreeForRentByDateValidationSchema: FastifySchema = {
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
      }
    },
    required: ['arrivalDate', 'departureDate'],
  }
};