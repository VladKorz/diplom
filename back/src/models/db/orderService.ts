import service from "./service";
import booking from "./booking";

import { DataTypes, Model } from 'sequelize';

import * as dbType from '../../types/db';
import db from '../../repository';

// Используется для учета заказов услуг
const orderService = db.define<
  Model<
    dbType.orderServiceDbRecordAttributes,
    dbType.orderServiceDbRecordCreationAttributes
  >
>('orderService', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    references: {
        model: service,
        key: 'id'
        
    }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    references: {
        model: booking,
        key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'done', 'cancelled']]
    }
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  price: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
});

export default orderService;