import * as coreType from './core'

// User model //
export type userDbRecordAttributes = coreType.id & coreType.userBasicInfo & coreType.userPasswordHash;
export interface userDbRecordCreationAttributes extends Omit<userDbRecordAttributes, 'id'> {}


// Permission model //
export type permissioDbRecordAttributes = coreType.permissionRecord
export interface permissionDbRecordCreationAttributes extends Omit<permissioDbRecordAttributes, 'id'> {}


// Booking //& { address: string, phone: string }
// Бронирование //
export type bookingDbRecordAttributes = coreType.id & coreType.bookingBasicInfo;
export interface bookingDbRecordCreationAttributes extends Omit<bookingDbRecordAttributes, 'id'> {};


// Client //
// Клиент //
export type clientDbRecordAttributes = coreType.id & coreType.clientBasicInfo;
export interface clientDbRecordCreationAttributes extends Omit<clientDbRecordAttributes, 'id'> {};



// Rent object //
// Объект аренды //
export type objectDbRecordAttributes = coreType.id & coreType.objectBasicInfo;
export interface objectDbRecordCreationAttributes extends Omit<objectDbRecordAttributes, 'id'> {};


// Payment //
// Плетеж //
export type paymentDbRecordAttributes = coreType.id & coreType.paymentBasicInfo;
export interface paymentDbRecordCreationAttributes extends Omit<Omit<paymentDbRecordAttributes, 'id'>, 'description'> {
  description?: string;
}



// Product //
// Продукция //
export type productDbRecordAttributes = coreType.id & coreType.productBasicInfo;
export interface productDbRecordCreationAttributes extends Omit<productDbRecordAttributes, 'id'> {};



// Service //
// Услуга //
export type serviceDbRecordAttributes = coreType.id & coreType.serviceBasicInfo;
export interface serviceDbRecordCreationAttributes extends Omit<serviceDbRecordAttributes, 'id'> {};


// Order Service //
export type orderServiceDbRecordAttributes = coreType.id & coreType.orderServiceBasicInfo;
export interface orderServiceDbRecordCreationAttributes extends Omit <orderServiceDbRecordAttributes, 'id'> {};

// Order Product //
export type orderProductDbRecordAttributes = coreType.id & coreType.orderProductBasicInfo;
export interface orderProductDbRecordCreationAttributes extends Omit<orderProductDbRecordAttributes, 'id'> {}

// Rent Object //
export type rentObjectDbRecordAttributes = coreType.id & coreType.rentObjectBasicInfo;
export interface rentObjectDbRecordCreationAttributes extends Omit<Omit<rentObjectDbRecordAttributes, 'id'>, 'isPaid'> {};