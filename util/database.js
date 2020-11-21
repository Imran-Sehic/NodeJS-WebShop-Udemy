const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize('node-products', 'root', 'root', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;