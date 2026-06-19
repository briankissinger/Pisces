export class UpdateOrderService {
    constructor(orderRepository, inventoryService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
        this.updateOrder = this.updateOrder.bind(this);
    }

    async updateOrder(orderId, payload) {
        try {
            if (!payload || !payload.orderStatus) {
                return { success: false, error: 'You can only update order status' };
            }

            const { success, error, data } = await this.orderRepository.update(orderId, payload);
            if (!success) {
                return { success, error };
            }

            if (payload.orderStatus === 'Cancelled' && this.inventoryService) {
                try {
                    const order = await this.orderRepository.getOrderById(orderId, [], 'fetch', true);
                    if (order && order.data && order.data.items) {
                        const orderItems = order.data.items.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                        }));
                        await this.inventoryService.releaseOrderStock(orderId, orderItems);
                    }
                } catch (stockError) {
                    console.error('Stock release after cancellation failed:', stockError);
                }
            }

            return { success, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
