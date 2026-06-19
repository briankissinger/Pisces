export class UpdatePaymentRequestService {
    constructor(paymentRequestRepository, inventoryService) {
        this.paymentRequestRepository = paymentRequestRepository;
        this.inventoryService = inventoryService;
        this.updatePaymentRequest = this.updatePaymentRequest.bind(this);
    }

    async updatePaymentRequest(payload) {
        try {
            if (!Object.keys(payload).length) {
                return { success: false, error: 'Empty payload' };
            }

            const result = await this.paymentRequestRepository.update(payload);
            const callbackData = payload.Body?.stkCallback || payload;

            const isSuccessful = callbackData.ResultCode === '0'
                || callbackData.ResultCode === 0
                || callbackData.StatusCode === '0';

            if (isSuccessful && this.inventoryService && callbackData.CheckoutRequestID) {
                try {
                    const transaction = await this.paymentRequestRepository.findByCheckoutRequestId
                        ? await this.paymentRequestRepository.findByCheckoutRequestId(callbackData.CheckoutRequestID)
                        : null;

                    if (transaction && transaction.orderItems && transaction.orderItems.length) {
                        await this.inventoryService.deductOrderStock(
                            transaction.orderId || callbackData.CheckoutRequestID,
                            transaction.orderItems,
                        );
                    }
                } catch (stockError) {
                    console.error('Stock deduction failed after payment confirmation:', stockError);
                }
            }

            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
