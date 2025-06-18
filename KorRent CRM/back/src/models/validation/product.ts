import { FastifySchema } from 'fastify';

// Common validation patterns
const idParam = {
  type: 'object',
  properties: {
    id: { type: 'number', minimum: 1 }
  },
  required: ['id']
};

const paginationQuery = {
  type: 'object',
  properties: {
    page: { type: 'number', minimum: 1, default: 1 },
    limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
  }
};

// Product CRUD validations
export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255
      },
      description: { 
        type: 'string',
        minLength: 1
      },
      price: { 
        type: 'number',
        minimum: 0
      }
    },
    required: ['name', 'description', 'price'],
    additionalProperties: false
  }
};

export const updateValidationSchema: FastifySchema = {
  params: idParam,
  body: {
    type: 'object',
    properties: {
      name: { 
        type: 'string',
        minLength: 1,
        maxLength: 255
      },
      description: { 
        type: 'string',
        minLength: 1
      },
      price: { 
        type: 'number',
        minimum: 0
      }
    },
    minProperties: 1,
    additionalProperties: false
  }
};

export const getProductSchema: FastifySchema = {
  params: idParam
};

export const getAllProductsSchema: FastifySchema = {
  querystring: paginationQuery
};

// Order validations
export const createOrderSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      productId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      }
    },
    required: ['productId', 'bookingId'],
    additionalProperties: false
  }
};

export const payForOrderSchema: FastifySchema = {
  params: idParam,
  body: {
    type: 'object',
    properties: {
      productId: { 
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
    required: ['productId', 'bookingId', 'amount'],
    additionalProperties: false
  }
};

export const cancelOrderSchema: FastifySchema = {
  params: idParam,
  body: {
    type: 'object',
    properties: {
      productId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      }
    },
    required: ['productId', 'bookingId'],
    additionalProperties: false
  }
};

export const getOrderStatusSchema: FastifySchema = {
  params: idParam,
  body: {
    type: 'object',
    properties: {
      productId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      }
    },
    required: ['productId', 'bookingId'],
    additionalProperties: false
  }
};

export const getProductOrdersSchema: FastifySchema = {
  params: idParam,
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuery.properties,
      status: { 
        type: 'string',
        enum: ['pending', 'done', 'cancelled']
      },
      isPaid: { 
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
};

export const getBookingProductOrdersSchema: FastifySchema = {
  params: idParam,
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuery.properties,
      status: { 
        type: 'string',
        enum: ['pending', 'done', 'cancelled']
      },
      isPaid: { 
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
};

export const getProductBookingOrdersSchema: FastifySchema = {
  params: idParam,
  querystring: {
    type: 'object',
    properties: {
      ...paginationQuery.properties,
      status: { 
        type: 'string',
        enum: ['pending', 'done', 'cancelled']
      },
      isPaid: { 
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
};

export const updateOrderStatusSchema: FastifySchema = {
  params: idParam,
  body: {
    type: 'object',
    properties: {
      productId: { 
        type: 'number',
        minimum: 1
      },
      bookingId: { 
        type: 'number',
        minimum: 1
      },
      status: {
        type: 'string',
        enum: ['pending', 'done', 'cancelled']
      }
    },
    required: ['productId', 'bookingId', 'status'],
    additionalProperties: false
  }
};
