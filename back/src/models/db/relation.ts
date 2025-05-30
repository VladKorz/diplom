import booking from './booking';
import user from './user';
import permission from './permission';
import client from './client';
import payment from './payment';
import product from './product';
import orderProduct from './orderProduct';
import service from './service';
import orderService from './orderService';

// User - Permission (One-to-Many)
user.hasMany(permission, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});

permission.belongsTo(user, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  onDelete: 'CASCADE'
});

// Client - Booking (One-to-Many)
client.hasMany(booking, {
  foreignKey: {
    name: 'clientId',
    allowNull: false
  },
  onDelete: 'SET_NULL'
});

booking.hasMany(payment, {
  foreignKey: {
    name: 'bookingId',
    allowNull: false
  },
})

// Product relations
booking.belongsToMany(product, { through: orderProduct, onDelete: 'CASCADE' });
product.belongsToMany(booking, { through: orderProduct, onDelete: 'CASCADE' });

// Service relations
booking.belongsToMany(service, { through: orderService, onDelete: 'CASCADE' });
service.belongsToMany(booking, { through: orderService, onDelete: 'CASCADE' });
