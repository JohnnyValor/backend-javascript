const bcrypt = require("bcryptjs");

// define "users" with attributes and association
'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define(
    'users',
    {
      UserId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      UserName: {
        type: DataTypes.STRING,
        unique: true
      },
      Password: DataTypes.STRING,
      Email: {
        type: DataTypes.STRING,
        unique: true
      },
      Admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      Deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  // associates "users" with "posts"
  users.associate = function (models) {
    users.hasMany(models.posts, {
      foreignKey: 'UserId'
    });
  };

  // compares plain text pw with hashed pw stored in "users"
  users.prototype.comparePassword = function (plainTextPassword) {
    let user = this;
    return bcrypt.compareSync(plainTextPassword, user.Password)
  };

  return users;
};
