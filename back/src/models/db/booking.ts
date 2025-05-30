import { DataTypes, Model } from 'sequelize';
import * as dbType from '../../types/db';
import db from '../../repository';
import client from './client';
import object from './object';

const booking = db.define<
  Model<dbType.bookingDbRecordAttributes, dbType.bookingDbRecordCreationAttributes>
>('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: client,
      key: 'id',
    },
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: object,
      key: 'id',
    },
  },
  arrivalDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  departureDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  generalPaymentAmount: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active'
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

export default booking;
