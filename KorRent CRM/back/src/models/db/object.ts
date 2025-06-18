import { DataTypes, Model } from 'sequelize';
import * as dbType from '../../types/db';
import db from '../../repository';

const object = db.define<
  Model<
    dbType.objectDbRecordAttributes,
    dbType.objectDbRecordCreationAttributes
  >
>('object', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  costPerHour: {
    type: DataTypes.NUMBER,
    allowNull: false,
  }
});

export default object;
