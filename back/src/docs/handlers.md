# API Handlers Documentation

## User Management

### Create User
**Handler**: `src/controllers/user/create.ts`
**Description**: Creates a new user in the system
**Input**:
```typescript
{
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  password: string;
}
```
**Output**:
```typescript
{
  message: string;
  userReply: {
    email: string;
    name: string;
    surname: string;
    phoneNumber: string;
  }
}
```
**Permissions**: Requires `user_create` permission
**Status Codes**:
- 201: User created successfully
- 403: Permission denied
- 400: Invalid input

### Update User
**Handler**: `src/controllers/user/update.ts`
**Description**: Updates an existing user's information
**Input**:
```typescript
{
  name?: string;
  email?: string;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `user_edit` permission
**Status Codes**:
- 200: User updated successfully
- 403: Permission denied
- 404: User not found

### Delete User
**Handler**: `src/controllers/user/delete.ts`
**Description**: Deletes a user from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `user_delete` permission
**Status Codes**:
- 200: User deleted successfully
- 403: Permission denied
- 404: User not found

## Client Management

### Create Client
**Handler**: `src/controllers/client/create.ts`
**Description**: Creates a new client in the system
**Input**:
```typescript
{
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
}
```
**Output**:
```typescript
{
  message: string;
  clientReply: {
    email: string;
    name: string;
    surname: string;
    phoneNumber: string;
  }
}
```
**Permissions**: Requires `client_create` permission
**Status Codes**:
- 201: Client created successfully
- 403: Permission denied
- 400: Invalid input

### Update Client
**Handler**: `src/controllers/client/update.ts`
**Description**: Updates an existing client's information
**Input**:
```typescript
{
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `client_edit` permission
**Status Codes**:
- 200: Client updated successfully
- 403: Permission denied
- 404: Client not found

### Delete Client
**Handler**: `src/controllers/client/delete.ts`
**Description**: Deletes a client from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `client_delete` permission
**Status Codes**:
- 200: Client deleted successfully
- 403: Permission denied
- 404: Client not found

## Product Management

### Create Product
**Handler**: `src/controllers/product/create.ts`
**Description**: Creates a new product in the system
**Input**:
```typescript
{
  name: string;
  description: string;
  price: number;
}
```
**Output**:
```typescript
{
  message: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
  }
}
```
**Permissions**: Requires `product_create` permission
**Status Codes**:
- 201: Product created successfully
- 403: Permission denied
- 400: Invalid input (empty name/description or negative price)

### Update Product
**Handler**: `src/controllers/product/update.ts`
**Description**: Updates an existing product's information
**Input**:
```typescript
{
  name?: string;
  description?: string;
  price?: number;
}
```
**Output**:
```typescript
{
  message: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
  }
}
```
**Permissions**: Requires `product_edit` permission
**Status Codes**:
- 200: Product updated successfully
- 403: Permission denied
- 404: Product not found
- 400: Invalid input

### Delete Product
**Handler**: `src/controllers/product/delete.ts`
**Description**: Deletes a product from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `product_delete` permission
**Status Codes**:
- 200: Product deleted successfully
- 403: Permission denied
- 404: Product not found

## Service Management

### Create Service
**Handler**: `src/controllers/service/create.ts`
**Description**: Creates a new service in the system
**Input**:
```typescript
{
  name: string;
  description: string;
  price: number;
}
```
**Output**:
```typescript
{
  message: string;
  service: {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
  }
}
```
**Permissions**: Requires `service_create` permission
**Status Codes**:
- 201: Service created successfully
- 403: Permission denied
- 400: Invalid input (empty name/description or negative price)

### Update Service
**Handler**: `src/controllers/service/update.ts`
**Description**: Updates an existing service's information
**Input**:
```typescript
{
  name?: string;
  description?: string;
  price?: number;
}
```
**Output**:
```typescript
{
  message: string;
  service: {
    id: number;
    name: string;
    description: string;
    price: number;
    status: string;
  }
}
```
**Permissions**: Requires `service_edit` permission
**Status Codes**:
- 200: Service updated successfully
- 403: Permission denied
- 404: Service not found
- 400: Invalid input

### Delete Service
**Handler**: `src/controllers/service/delete.ts`
**Description**: Deletes a service from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `service_delete` permission
**Status Codes**:
- 200: Service deleted successfully
- 403: Permission denied
- 404: Service not found

## Booking Management

### Create Booking
**Handler**: `src/controllers/booking/create.ts`
**Description**: Creates a new booking in the system
**Input**:
```typescript
{
  arrivalDate: string; // ISO date string
  departureDate: string; // ISO date string
  clientId: number;
  objectId: number;
  generalPaymentAmount?: number;
}
```
**Output**:
```typescript
{
  message: string;
  booking: {
    id: number;
    arrivalDate: Date;
    departureDate: Date;
    clientId: number;
    objectId: number;
    status: string;
  }
}
```
**Permissions**: Requires `booking_create` permission
**Status Codes**:
- 201: Booking created successfully
- 403: Permission denied
- 400: Invalid input (invalid dates, past dates, or duration > 30 days)

### Update Booking
**Handler**: `src/controllers/booking/update.ts`
**Description**: Updates an existing booking's information
**Input**:
```typescript
{
  arrivalDate?: string; // ISO date string
  departureDate?: string; // ISO date string
}
```
**Output**:
```typescript
{
  message: string;
  booking: {
    id: number;
    arrivalDate: Date;
    departureDate: Date;
    clientId: number;
    objectId: number;
    status: string;
  }
}
```
**Permissions**: Requires `booking_edit` permission
**Status Codes**:
- 200: Booking updated successfully
- 403: Permission denied
- 404: Booking not found
- 400: Invalid input

### Delete Booking
**Handler**: `src/controllers/booking/delete.ts`
**Description**: Deletes a booking from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `booking_delete` permission
**Status Codes**:
- 200: Booking deleted successfully
- 403: Permission denied
- 404: Booking not found

## Payment Management

### Create Payment
**Handler**: `src/controllers/payment/create.ts`
**Description**: Creates a new payment in the system
**Input**:
```typescript
{
  date: string; // ISO date string
  amount: number;
  bookingId?: number;
}
```
**Output**:
```typescript
{
  message: string;
  payment: {
    id: number;
    date: Date;
    amount: number;
    bookingId?: number;
    status: string;
  }
}
```
**Permissions**: Requires `payment_create` permission
**Status Codes**:
- 201: Payment created successfully
- 403: Permission denied
- 400: Invalid input (missing date or amount <= 0)

### Update Payment
**Handler**: `src/controllers/payment/update.ts`
**Description**: Updates an existing payment's information
**Input**:
```typescript
{
  date?: string; // ISO date string
  amount?: number;
}
```
**Output**:
```typescript
{
  message: string;
  payment: {
    id: number;
    date: Date;
    amount: number;
    bookingId?: number;
    status: string;
  }
}
```
**Permissions**: Requires `payment_edit` permission
**Status Codes**:
- 200: Payment updated successfully
- 403: Permission denied
- 404: Payment not found
- 400: Invalid input (amount <= 0)

### Delete Payment
**Handler**: `src/controllers/payment/delete.ts`
**Description**: Deletes a payment from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `payment_delete` permission
**Status Codes**:
- 200: Payment deleted successfully
- 403: Permission denied
- 404: Payment not found

## Rent Object Management

### Create Rent Object
**Handler**: `src/controllers/object/create.ts`
**Description**: Creates a new rent object in the system
**Input**:
```typescript
{
  name: string;
  description: string;
  costPerHour: number;
  available?: boolean;
}
```
**Output**:
```typescript
{
  message: string;
  object: {
    id: number;
    name: string;
    description: string;
    costPerHour: number;
    available: boolean;
    status: string;
  }
}
```
**Permissions**: Requires `rent_object_create` permission
**Status Codes**:
- 201: Object created successfully
- 403: Permission denied
- 400: Invalid input

### Update Rent Object
**Handler**: `src/controllers/object/update.ts`
**Description**: Updates an existing rent object's information
**Input**:
```typescript
{
  name?: string;
  description?: string;
  costPerHour?: number;
  available?: boolean;
}
```
**Output**:
```typescript
{
  message: string;
  object: {
    id: number;
    name: string;
    description: string;
    costPerHour: number;
    available: boolean;
    status: string;
  }
}
```
**Permissions**: Requires `rent_object_edit` permission
**Status Codes**:
- 200: Object updated successfully
- 403: Permission denied
- 404: Object not found
- 400: Invalid input

### Delete Rent Object
**Handler**: `src/controllers/object/delete.ts`
**Description**: Deletes a rent object from the system
**Input**:
```typescript
{
  id: number;
}
```
**Output**:
```typescript
{
  message: string;
}
```
**Permissions**: Requires `rent_object_delete` permission
**Status Codes**:
- 200: Object deleted successfully
- 403: Permission denied
- 404: Object not found 