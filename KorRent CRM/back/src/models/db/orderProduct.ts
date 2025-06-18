import product from "./product";
import booking from "./booking";

import { DataTypes, Model } from 'sequelize';

import * as dbType from '../../types/db';
import db from '../../repository';

// Используется для учета заказов продукции
const orderProduct = db.define<
  Model<
    dbType.orderProductDbRecordAttributes,
    dbType.orderProductDbRecordCreationAttributes
  >
>('orderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: product,
      key: 'id'
    }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

export default orderProduct;