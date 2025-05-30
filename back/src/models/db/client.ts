import { DataTypes, Model } from 'sequelize';

import * as dbType from '../../types/db';
import db from '../../repository';

const client = db.define<
  Model<
    dbType.clientDbRecordAttributes,
    dbType.clientDbRecordCreationAttributes
  >
>('client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default client;