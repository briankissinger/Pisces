import { RandomCodeGenerator } from '../../../common/generating_unique_codes.js';
import { ValidateObjectPayload } from '../../validation/validate.object.payload.js';

export class CreateCartService {
    constructor(cartRepository, inventoryService) {
        this.cartRepository = cartRepository;
        this.inventoryService = inventoryService;
        this.createCart = this.createCart.bind(this);
    }

    async createCart(userId, payload, model) {
        try {
            if (!userId) {
                return { success: false, error: 'Invalid user!' };
            }
            if (!payload) {
                return { success: false, error: "Can't add empty item to cart!" };
            }
            if (typeof payload !== 'object') {
                return { success: false, error: 'Item must be a key value pair of item information' };
            }
            if (Object.keys(payload).length === 0) {
                return { success: false, error: "Can't add empty item to cart!" };
            }

            if (payload.variantId && this.inventoryService) {
                try {
                    const stock = await this.inventoryService.getVariantStock(payload.variantId);
                    if (!stock.isAvailable) {
                        return { success: false, error: 'This item is currently out of stock' };
                    }
                    if (payload.quantity && stock.quantity < payload.quantity) {
                        return {
                            success: false,
                            error: `Insufficient stock. Requested ${payload.quantity}, available ${stock.quantity}`,
                        };
                    }
                } catch (stockError) {
                    return { success: false, error: stockError.message };
                }
            }

            payload.cartId = RandomCodeGenerator(40, 'CT');
            payload.userId = userId;
            payload.item.itemId = RandomCodeGenerator(10, 'CI');
            payload.item.cartId = payload.cartId;
            new ValidateObjectPayload(payload);
            const { success, error, data: cart } = await this.cartRepository.create(userId, payload, model);
            if (!success) {
                return { success: false, error };
            }
            return { success: true, cart };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
