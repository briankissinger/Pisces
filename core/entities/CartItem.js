export class CartItem {
    constructor(itemId, cartId, variantId, name, quantity, price) {
        this.itemId = itemId;
        this.cartId = cartId;
        this.variantId = variantId;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.totalPrice = parseFloat(price) * quantity;
    }
}
