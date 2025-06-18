import { DataTypes, Model } from 'sequelize';
import * as dbType from '../../types/db';
import db from '../../repository';
import booking from './booking';


const payment = db.define<
  Model<dbType.paymentDbRecordAttributes, dbType.paymentDbRecordCreationAttributes>
>('payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: booking,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
});

export default payment;