export class StockMovement {
    constructor(stockMovementId, variantId, type, quantity, referenceType, referenceId, notes = null) {
        this.stockMovementId = stockMovementId;
        this.variantId = variantId;
        this.type = type;
        this.quantity = quantity;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdAt = new Date();
    }

    toPersistenceObject() {
        return {
            stockMovementId: this.stockMovementId,
            variantId: this.variantId,
            type: this.type,
            quantity: this.quantity,
            referenceType: this.referenceType,
            referenceId: this.referenceId,
            notes: this.notes,
            createdAt: this.createdAt,
        };
    }
}
