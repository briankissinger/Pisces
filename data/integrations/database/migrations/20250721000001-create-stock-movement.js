export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StockMovements', {
      stockMovementId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(255),
      },
      variantId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        references: {
          model: 'ProductVariants',
          key: 'variantId',
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('INITIAL', 'RESTOCK', 'DEDUCTION', 'RELEASE', 'ADJUSTMENT', 'RESERVATION'),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referenceType: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      referenceId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex('StockMovements', ['variantId'], { name: 'idx_sm_variantId' });
    await queryInterface.addIndex('StockMovements', ['referenceType', 'referenceId'], { name: 'idx_sm_reference' });
    await queryInterface.addIndex('StockMovements', ['createdAt'], { name: 'idx_sm_createdAt' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StockMovements');
  },
};
