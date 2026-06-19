import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class StockMovement extends Model {
    static associate(models) {
      this.belongsTo(models.ProductVariant, {
        foreignKey: {
          name: 'variantId',
          allowNull: false,
        },
      });
    }
  }
  StockMovement.init({
    stockMovementId: {
      type: DataTypes.STRING(255),
      primaryKey: true,
    },
    variantId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('INITIAL', 'RESTOCK', 'DEDUCTION', 'RELEASE', 'ADJUSTMENT', 'RESERVATION'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'StockMovement',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['variantId'],
        name: 'idx_sm_variantId',
      },
      {
        unique: false,
        fields: ['referenceType', 'referenceId'],
        name: 'idx_sm_reference',
      },
      {
        unique: false,
        fields: ['createdAt'],
        name: 'idx_sm_createdAt',
      },
    ],
  });
  return StockMovement;
};
