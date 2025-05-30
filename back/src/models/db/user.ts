import { DataTypes, Model } from 'sequelize';
import * as dbType from '../../types/db';
import db from '../../repository';

const user = db.define<
  Model<dbType.userDbRecordAttributes, dbType.userDbRecordCreationAttributes>
>('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

export default user;
