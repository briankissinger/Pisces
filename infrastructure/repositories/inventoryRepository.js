import { IInventoryRepository } from '../../core/repositories/interfaces/inventoryRepository.js';
import { StockMovement } from '../../core/entities/StockMovement.js';
import { RandomCodeGenerator } from '../../common/generating_unique_codes.js';

export class SequelizeInventoryRepository extends IInventoryRepository {
    constructor(sequelizeInstance, variantModel, stockMovementModel) {
        super();
        this.sequelizeInstance = sequelizeInstance;
        this.variantModel = variantModel;
        this.stockMovementModel = stockMovementModel;
    }

    async getVariantStock(variantId, options = {}) {
        const transaction = options.transaction || null;
        const variant = await this.variantModel.findByPk(variantId, {
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined,
        });
        if (!variant) {
            throw new Error(`Variant ${variantId} not found`);
        }
        const data = variant.toJSON();
        return {
            variantId: data.variantId,
            quantity: data.quantity,
            isAvailable: data.quantity > 0,
        };
    }

    async deductStock(variantId, quantity, referenceType, referenceId, options = {}) {
        if (quantity <= 0) {
            throw new Error('Deduction quantity must be positive');
        }

        const transaction = options.transaction || await this.sequelizeInstance.transaction();
        const ownTransaction = !options.transaction;

        try {
            const variant = await this.variantModel.findByPk(variantId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!variant) {
                throw new Error(`Variant ${variantId} not found`);
            }

            const currentQty = variant.get('quantity');
            if (currentQty < quantity) {
                throw new Error(
                    `Insufficient stock for variant ${variantId}: requested ${quantity}, available ${currentQty}`
                );
            }

            const newQuantity = currentQty - quantity;
            await variant.update({ quantity: newQuantity }, { transaction });

            const movementId = RandomCodeGenerator(12, 'SM');
            const movement = new StockMovement(
                movementId,
                variantId,
                'DEDUCTION',
                -quantity,
                referenceType,
                referenceId,
                `Deducted ${quantity} units. Previous: ${currentQty}, New: ${newQuantity}`
            );
            await this.stockMovementModel.create(movement.toPersistenceObject(), { transaction });

            if (ownTransaction) {
                await transaction.commit();
            }

            return {
                success: true,
                previousQuantity: currentQty,
                newQuantity,
                movementId,
            };
        } catch (error) {
            if (ownTransaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async releaseStock(variantId, quantity, referenceType, referenceId, options = {}) {
        if (quantity <= 0) {
            throw new Error('Release quantity must be positive');
        }

        const transaction = options.transaction || await this.sequelizeInstance.transaction();
        const ownTransaction = !options.transaction;

        try {
            const variant = await this.variantModel.findByPk(variantId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!variant) {
                throw new Error(`Variant ${variantId} not found`);
            }

            const currentQty = variant.get('quantity');
            const newQuantity = currentQty + quantity;
            await variant.update({ quantity: newQuantity }, { transaction });

            const movementId = RandomCodeGenerator(12, 'SM');
            const movement = new StockMovement(
                movementId,
                variantId,
                'RELEASE',
                quantity,
                referenceType,
                referenceId,
                `Released ${quantity} units. Previous: ${currentQty}, New: ${newQuantity}`
            );
            await this.stockMovementModel.create(movement.toPersistenceObject(), { transaction });

            if (ownTransaction) {
                await transaction.commit();
            }

            return {
                success: true,
                previousQuantity: currentQty,
                newQuantity,
                movementId,
            };
        } catch (error) {
            if (ownTransaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async getStockMovements(variantId) {
        const movements = await this.stockMovementModel.findAll({
            where: { variantId },
            order: [['createdAt', 'DESC']],
        });
        return movements.map(m => m.toJSON());
    }

    async getBatchStock(variantIds) {
        const variants = await this.variantModel.findAll({
            where: { variantId: variantIds },
            attributes: ['variantId', 'quantity'],
        });
        const stockMap = {};
        for (const v of variants) {
            const data = v.toJSON();
            stockMap[data.variantId] = {
                quantity: data.quantity,
                isAvailable: data.quantity > 0,
            };
        }
        return stockMap;
    }
}
