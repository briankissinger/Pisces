export class IInventoryRepository {
    async getVariantStock(variantId) {
        throw new Error('getVariantStock() must be implemented');
    }

    async deductStock(variantId, quantity, referenceType, referenceId, options = {}) {
        throw new Error('deductStock() must be implemented');
    }

    async releaseStock(variantId, quantity, referenceType, referenceId, options = {}) {
        throw new Error('releaseStock() must be implemented');
    }

    async getStockMovements(variantId) {
        throw new Error('getStockMovements() must be implemented');
    }

    async getBatchStock(variantIds) {
        throw new Error('getBatchStock() must be implemented');
    }
}
