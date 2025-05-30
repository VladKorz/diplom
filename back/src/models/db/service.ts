import { DataTypes, Model } from 'sequelize';

import * as dbType from '../../types/db';
import db from '../../repository';

const service = db.define<
  Model<
    dbType.serviceDbRecordAttributes,
    dbType.serviceDbRecordCreationAttributes
  >
>('service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.NUMBER,
    allowNull: false
  },
});

export default service;