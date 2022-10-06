'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await
      queryInterface.addColumn('posts', 'Deleted', Sequelize.INTEGER, {
        allowNull: true
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('posts', 'Deleted');
  }
};
