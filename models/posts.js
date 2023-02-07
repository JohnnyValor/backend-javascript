// define "posts" with attributes & associations
'use strict';
module.exports = (sequelize, DataTypes) => {
  var posts = sequelize.define(
    'posts',
    {
      PostId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      PostTitle: DataTypes.STRING,
      PostBody: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      Deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );

  posts.associate = function (models) {
    posts.belongsTo(models.users, {
      foreignKey: 'UserId'
    });
  };

  return posts;
};
