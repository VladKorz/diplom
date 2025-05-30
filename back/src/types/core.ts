export interface id {
  id: number;
}

export interface userId {
  userId: number;
}

export interface nameDescription {
  name: string,
  description: string
}

// User //
// Сотрудник //

export type userBasicInfo = {
  email: string;
  name: string; // имя
  surname: string // фамилия
  phoneNumber: string // номер телефона
};

export interface userUpdateBasicInfo extends Partial<userBasicInfo> {}

export type userBasicInfoWithId = userBasicInfo & id;

export interface userPassword {
  password: string;
}

export interface userPasswordHash {
  passwordHash: string;
}

export type userCreateRequest = userBasicInfo & userPassword;

// Permission //

// This enum is being used by db model //
// NOTE: do not modify the order!! //
export enum role {
  // System permissions
  read_all_users = 'read_all_users',
  read_all_managers = 'read_all_managers',
  read_all_admins = 'read_all_admins',
  assign_role = 'assign_role',
  absolve_role = 'absolve_role',

  // User management
  user_create = 'user_create',
  user_edit = 'user_edit',
  user_view = 'user_view',
  user_delete = 'user_delete',

  // Payment management
  payment_create = 'payment_create',
  payment_edit = 'payment_edit',
  payment_view = 'payment_view',
  payment_delete = 'payment_delete',

  // Rent object management
  rent_object_create = 'rent_object_create',
  rent_object_edit = 'rent_object_edit',
  rent_object_view = 'rent_object_view',
  rent_object_delete = 'rent_object_delete',

  // Service management
  service_create = 'service_create',
  service_edit = 'service_edit',
  service_view = 'service_view',
  service_delete = 'service_delete',

  // Client management
  client_create = 'client_create',
  client_edit = 'client_edit',
  client_view = 'client_view',
  client_delete = 'client_delete',

  // Booking management
  booking_create = 'booking_create',
  booking_edit = 'booking_edit',
  booking_view = 'booking_view',
  booking_delete = 'booking_delete',
  booking_cancel = "booking_cancel",


  // Product management
  product_create = 'product_create',
  product_edit = 'product_edit',
  product_view = 'product_view',
  product_delete = 'product_delete',

  // Client permissions
  order_products = 'order_products',
  order_products_edit = 'order_products_edit',
  order_view_products = 'order_view_products',
  order_view_service = "order_view_service",
  product_client_view = 'product_client_view',
  disorder_product = 'disorder_product',
  order_service = 'order_service',
  order_service_edit = 'order_service_edit',
  service_client_view = 'service_client_view',
  disorder_service = 'disorder_service',
  rent_object_client_view = 'rent_object_client_view',
  booking_client_view = 'booking_client_view',
  payment_client_view = 'payment_client_view',
  booking_client_create = 'booking_client_create',
  booking_client_cancel = 'booking_client_cancel',
  payment_client_create = 'payment_client_create',
}

export type permission = { body: role }
export type permissionRecord = permission & id & userId;

// Client //
// Клиент //
export type clientId = { clientId: number };
export type clientBasicInfo = userBasicInfo;
export interface clientUpdateBasicInfo extends Partial<clientBasicInfo> {};

// Booking //& { address: string, phone: string }
// Бронирование //
export type bookingId = { bookingId: number };
export type arrivalDate = { arrivalDate: Date };
export type departureDate = { departureDate: Date };
export type bookingBasicInfo = clientId & objectId & arrivalDate & departureDate & {
  generalPaymentAmount: number // общая стоимость аренды. Считается в конце бронирования, основываясь на всех заказанных услугах
  status: string;
  isPaid: boolean;
}

export interface bookingUpdateBasicInfo extends Partial<bookingBasicInfo> {};


// Rent object //
// Объект аренды //
export type objectId = { objectId: number };
export type objectBasicInfo = nameDescription & {
  costPerHour: number, // стоимость часа аренды
}
export interface objectUpdateBasicInfo extends Partial<objectBasicInfo> {};


// Payment //
// Плетеж //
export type amount = { amount: number };
export type paymentBasicInfo = bookingId & amount & {
  date: Date, // время платежа
  description: string,
};
export interface paymentUpdateBasicInfo extends Partial<paymentBasicInfo> {};


// Product //
// Продукция //
export type productId = { productId: number };
export type productBasicInfo = nameDescription & { price: number };
export interface productUpdateBasicInfo extends Partial<productBasicInfo> {};

// Service //
// Услуга //
export type serviceId = { serviceId: number };
export type serviceBasicInfo = nameDescription & {
  price: number // цена
};
export interface serviceUpdateBasicInfo extends Partial<serviceBasicInfo> {};


// Order service //
export type isPaid = { isPaid: boolean };
export type orderServiceBasicInfo = serviceId & bookingId & isPaid & {
  status: 'pending' | 'done' | 'cancelled';
  price: number;
};
export interface orderServiceUpdateBasicInfo extends Partial<orderServiceBasicInfo> {};

// Order product //
export type orderProductBasicInfo = productId & bookingId & isPaid & {
  status: 'pending' | 'done' | 'cancelled';
  price: number;
};

export interface orderProductUpdateBasicInfo extends Partial<orderProductBasicInfo> {}

// Rent object //
export type time = { time: number }; // Время которое оплачено
export type rentObjectBasicInfo = objectId & bookingId & isPaid;
export interface rentObjectUpdateBasicInfo extends Partial<rentObjectBasicInfo> {};

// Rent object operations
export type rentObjectRequest = objectId & bookingId & time;
export type payForRentRequest = objectId & bookingId & amount;
export type rentStatusRequest = arrivalDate & departureDate;