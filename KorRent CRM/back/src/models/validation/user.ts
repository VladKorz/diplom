import { FastifySchema } from 'fastify';

const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
const phonePattern = '^\\+?[1-9]\\d{1,14}$';
const passwordPattern = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$';

export const createValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: { 
        type: 'string',
        pattern: emailPattern,
        format: 'email'
      },
      name: { 
        type: 'string',
        minLength: 2,
        maxLength: 50
      },
      surname: { 
        type: 'string',
        minLength: 2,
        maxLength: 50
      },
      phoneNumber: { 
        type: 'string',
        pattern: phonePattern
      },
      password: { 
        type: 'string',
        pattern: passwordPattern,
        minLength: 8
      },
    },
    required: ['email', 'name', 'surname', 'password'],
    additionalProperties: false
  },
};

export const updateValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: { 
        type: 'string',
        pattern: emailPattern,
        format: 'email'
      },
      name: { 
        type: 'string',
        minLength: 2,
        maxLength: 50
      },
      surname: { 
        type: 'string',
        minLength: 2,
        maxLength: 50
      },
      phoneNumber: { 
        type: 'string',
        pattern: phonePattern
      }
    },
    minProperties: 1,
    additionalProperties: false
  },
};

export const updatePasswordValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      password: { 
        type: 'string',
        pattern: passwordPattern,
        minLength: 8
      },
    },
    required: ['password'],
    additionalProperties: false
  },
};

export const loginValidationSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      email: { 
        type: 'string',
        pattern: emailPattern,
        format: 'email'
      },
      password: { 
        type: 'string',
        minLength: 8
      },
    },
    required: ['email', 'password'],
    additionalProperties: false
  },
};
