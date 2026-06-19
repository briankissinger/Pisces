export class InventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    async validateCartItemsStock(cart) {
        if (!cart || !cart.items || !cart.items.length) {
            return { success: false, error: 'Cart is empty' };
        }

        const variantIds = cart.items.map(item => item.variantId).filter(Boolean);
        if (!variantIds.length) {
            return { success: true };
        }

        const stockMap = await this.inventoryRepository.getBatchStock(variantIds);
        const failures = [];

        for (const item of cart.items) {
            const stock = stockMap[item.variantId];
            if (!stock) {
                failures.push({ variantId: item.variantId, name: item.name, reason: 'Variant not found' });
                continue;
            }
            if (stock.quantity < item.quantity) {
                failures.push({
                    variantId: item.variantId,
                    name: item.name,
                    requested: item.quantity,
                    available: stock.quantity,
                    reason: `Insufficient stock`,
                });
            }
        }

        if (failures.length) {
            return { success: false, error: 'Some items are out of stock', failures };
        }

        return { success: true };
    }

    async deductOrderStock(orderId, orderItems) {
        if (!orderItems || !orderItems.length) {
            return { success: false, error: 'No items to deduct' };
        }

        const results = [];
        for (const item of orderItems) {
            try {
                const result = await this.inventoryRepository.deductStock(
                    item.variantId,
                    item.quantity,
                    'order',
                    orderId,
                );
                results.push(result);
            } catch (error) {
                return { success: false, error: error.message, results };
            }
        }
        return { success: true, results };
    }

    async releaseOrderStock(orderId, orderItems) {
        if (!orderItems || !orderItems.length) {
            return { success: false, error: 'No items to release' };
        }

        const results = [];
        for (const item of orderItems) {
            try {
                const result = await this.inventoryRepository.releaseStock(
                    item.variantId,
                    item.quantity,
                    'order',
                    orderId,
                    { notes: `Release from cancelled order ${orderId}` },
                );
                results.push(result);
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return { success: true, results };
    }

    async getVariantStock(variantId) {
        return this.inventoryRepository.getVariantStock(variantId);
    }
}
