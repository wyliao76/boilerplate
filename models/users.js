'use strict'
module.exports = (sequelize, DataTypes) => {
  const options = {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
  const users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, options)
  users.associate = (models) => {
    // associations can be defined here
  }
  const AuditTrail = require(`${SERVICES_PATH}/audit_trail`)
  AuditTrail(users, sequelize, DataTypes, options)
  return users
}
