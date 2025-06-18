import { DataTypes, Model } from 'sequelize';

import user from './user';

import * as coreType from '../../types/core'
import * as dbType from '../../types/db';
import db from '../../repository';

const permission = db.define<
  Model<
    dbType.permissioDbRecordAttributes,
    dbType.permissionDbRecordCreationAttributes
  >
>('permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: user,
      key: 'id',
    },
    onDelete: 'CASCADE'
  },
  body: {
    type: DataTypes.ENUM,
    values: Object.values(coreType.role), // Use the enum values
    allowNull: false,
  },
});

export default permission;
